# Pipeline

This file complements `SKILL.md`. It describes what each phase reads and writes, and the edge cases the orchestrator should handle.

## Dig Files

```text
<DIG>/
├── _meta/
│   ├── scout.js wave.js process-wave.js consolidation.js build-site.mjs serve.mjs site-template.html
│   ├── dig.json            manifest: {topic, slug, dig_path, base, created, status, waves_done, consolidation_label}
│   ├── taxonomy.json       written by scout; downstream phases read it
│   ├── extraction-spec.md  written by scout; research agents read it
│   ├── frontier-w<N>.json  wave queue: {wave:N, pending:[item,...]}; the newest file is live state
│   ├── seen.json           cumulative normalized targets
│   ├── sources.json        cumulative source registry
│   └── wave-<N>-out.json   wave result written by the orchestrator, read by process-wave.js
├── entries/                raw audit trail, one file per researched source
├── subtopics/<slug>.md     consolidated digest per subtopic
├── cross-cutting/<slug>.md consolidated digest per cross-cutting theme
├── OVERVIEW.md             consolidated overview and comparison tables
├── frontier.md sources.md CHANGELOG.md
└── dist/index.html
```

## Frontier Item

```json
{
  "subtopic_slug": "<kebab>",
  "source_type": "primary_official|reference_docs|expert_analysis|community_discussion|community_media|aggregator_list|academic|cross_cutting",
  "query_or_url": "<URL or precise search query>",
  "why": "<why this target matters>",
  "priority": 1
}
```

`priority` 1 is highest. `process-wave.js` sorts pending items by ascending priority.

## Taxonomy

```json
{
  "topic": "...",
  "slug": "...",
  "groups": [{"id":"...","label":"..."}],
  "subtopics": [{"slug":"...","title":"...","group":"<group-id>","globs":["*.<slug>.*"]}],
  "crosscutting": [{"slug":"...","title":"...","grep":"kw1|kw2|kw3"}],
  "site": {"eyebrow":"...","brand":"...","brand_sub":"...","title":"...","tagline":"...","foot":"..."}
}
```

`globs` tell consolidation which entries belong to a subtopic. Always include `*.<slug>.*` because entry filenames follow `<id>.<subtopic_slug>.<short>.md`.

## Scout

Scout has two stages:

- Council: several independent Opus agents propose groups, subtopics, cross-cutting themes, seed frontier, and extraction notes after brief web reconnaissance.
- Synthesis: one Opus agent merges proposals and writes `taxonomy.json`, `extraction-spec.md`, and `frontier-w1.json`.

The synthesis stage is schema-free because its artifacts are files. Verify generated JSON before continuing.

## Wave

The wave loader finds the newest `frontier-w*.json`, reads `taxonomy.json` and `extraction-spec.md`, and selects a batch. Research agents fetch or search targets, extract claims with A/B/C/D confidence tiers, write entries, and return:

- entries written
- researched targets
- new frontier items
- sources seen
- per-subtopic counts
- total claim count

`new_frontier` must use valid subtopic slugs from the taxonomy.

## Process Wave

`process-wave.js`:

1. Reads the wave output file or sidecar files.
2. Subtracts researched targets from the frontier that fed the wave.
3. Merges remaining targets with `new_frontier`.
4. Deduplicates against `seen.json`.
5. Writes `frontier-w<N+1>.json`, `seen.json`, `sources.json`, `sources.md`, `frontier.md`, and `CHANGELOG.md`.
6. Updates `dig.json`.
7. Prints a short report, including `FRONTIER DRY` when no pending items remain.

## Consolidation

Consolidation is schema-free and file-first. Agents write digest files and return short confirmations. Batches are small and idempotent: if a digest already carries the current `CONSOLIDATION_LABEL`, it is skipped.

Before a new consolidation pass, bump `CONSOLIDATION_LABEL` in `<DIG>/_meta/consolidation.js`.

## Website

`build-site.mjs` reads taxonomy, `OVERVIEW.md`, subtopic digests, and cross-cutting digests. It injects data into `site-template.html` and writes `dist/index.html`. The page is `noindex` by default and renders confidence tier badges from `[A]`, `[B]`, `[C]`, and `[D]` markers.

## Edge Cases

- Dry frontier after a light dig: consolidate what exists and build the site.
- Uneven coverage: run a one-off critic/broadening wave that reads counters from `CHANGELOG.md` and entries, then seeds weak areas.
- Malformed scout JSON: rerun scout or repair the small JSON file before wave 1.
- Throttling: wait and resume the same wave. Entries and seen targets make retries safe.
- Resume: live state is on disk; continue from the newest non-empty frontier.
