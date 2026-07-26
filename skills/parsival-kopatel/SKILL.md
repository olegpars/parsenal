---
name: parsival-kopatel
description: Use when the user explicitly asks to dig deeply or exhaustively into a topic, build a reusable knowledge base, continue an existing dig, or adopt an existing research folder with kopatel (Russian for 'digger'). Part of the Parsival skill system. Triggers include "dig deep into X", "exhaustively research X", "build a knowledge base on X", and similar explicit requests.
---

# parsival-kopatel

You are the thin orchestrator for an autonomous deep-research pipeline. Workflow agents do the heavy work; your job is to start phases, persist large results through Node scripts on disk, keep state resumable, and show the user the small decisions that matter.

Read `references/hard-lessons.md` before the first real run. Use `references/pipeline.md` for file schemas and phase mechanics, `references/heartbeat.md` for crash recovery, `references/unattended.md` for unattended recipes, `references/overnight-runner.md` for the headless overnight runner, and `references/adopt-existing.md` when attaching kopatel to an existing research folder.

## Model Split

State this split to the user before running a large dig:

- Page extraction waves: Sonnet, for breadth across many sources.
- Scout and consolidation: Opus, for taxonomy, synthesis, and deduplication.

Do not silently change the split. If the user asks for another model mix, explain the cost and quality tradeoff.

## Locations

- Skill engine templates live in this skill's `engine/` directory.
- Per-topic dig data lives outside the skill repo. The default base is `./digs`, so a new dig goes to `./digs/<slug>/` relative to the current project.
- A dig is self-contained after initialization: `init-dig.mjs` copies engine templates to `<DIG>/_meta/` and bakes the dig path, topic, and slug into those copies.

`<SKILL_DIR>` means this skill directory. `<DIG>` means the dig folder.

## Session Flow

### 0. Kickoff

Classify the request before doing work:

- NEW: no existing `./digs/<slug>/`. Ask for topic and mode, then initialize.
- RESUME: `<DIG>/_meta/dig.json` and a latest `frontier-wN.json` exist. Do not reinitialize. Show `waves_done`, status, and latest frontier size, then continue.
- ADOPT: an existing research folder should become a kopatel dig. Use `init-dig.mjs --adopt`; do not overwrite content. See `references/adopt-existing.md`.

Ask only one question at a time:

1. Topic: one topic per dig. If it is too broad, offer a tighter scope.
2. Mode: `light` means 1-2 waves for a quick slice. `full` means keep going until the frontier is dry or the user stops it.

Do not ask for a path by default. Show: `I will save this in ./digs/<slug>/; tell me a different base if needed.`

For `full`, use Recipe A from `references/unattended.md`: a supervised allowlist plus heartbeat. For a fully headless overnight run, use Recipe B from `references/overnight-runner.md` and the bundled `scripts/overnight.*` runner.

### 1. Scout

Initialize a new dig:

```bash
node "<SKILL_DIR>/engine/init-dig.mjs" "<topic>" "<slug>"
```

Then run:

```text
Workflow { scriptPath: "<DIG>/_meta/scout.js" }
```

If the user already has a seed taxonomy, pass it as `args.seed_taxonomy`. After scout, verify these files exist and parse:

- `<DIG>/_meta/taxonomy.json`
- `<DIG>/_meta/extraction-spec.md`
- `<DIG>/_meta/frontier-w1.json`

Show the taxonomy to the user before the wave loop. This is the cheapest point to correct scope.

### 2. Wave Loop

For each wave `N`, based on the latest `frontier-wN.json`:

```text
Workflow { scriptPath: "<DIG>/_meta/wave.js" }
```

Write the returned result to:

```text
<DIG>/_meta/wave-<N>-out.json
```

Then process it:

```bash
node "<DIG>/_meta/process-wave.js" "<DIG>/_meta/wave-<N>-out.json" <N>
```

Read only the short report. Commit after each wave if the dig folder is in a Git repo. Re-arm heartbeat for a supervised `full` run.

Stop the loop when the frontier is dry, the selected mode is complete, the user says stop, usage budget is close, or service throttling appears. If throttled, wait and resume; do not hammer retries.

### 3. Consolidation

Every few waves and at the end, consolidate. Before each new consolidation pass, bump this line in `<DIG>/_meta/consolidation.js`:

```js
const CONSOLIDATION_LABEL = 'pass-2'
```

Then run:

```text
Workflow { scriptPath: "<DIG>/_meta/consolidation.js" }
```

The label makes consolidation idempotent: existing digests with the current label are skipped.

### 4. Website

Build the static site:

```bash
node "<DIG>/_meta/build-site.mjs"
```

This writes `<DIG>/dist/index.html`. Preview locally if requested:

```bash
node "<DIG>/_meta/serve.mjs"
```

Deploy only after explicit user confirmation.

## Resume

Find the highest-numbered `<DIG>/_meta/frontier-wN.json`.

- If it has pending items, continue the wave loop from `N`.
- If it is empty, consolidate and build the site, or run a one-off broadening wave if coverage is visibly uneven.
- Use `<DIG>/_meta/dig.json` for `waves_done`, status, and consolidation label.

## Invariants

- Keep the orchestrator thin. Large wave output goes to disk, then Node scripts merge and render it.
- Do not rely on Workflow `args` for critical state. Read state from files.
- Preserve A/B/C/D confidence tiers on every claim.
- Keep raw entries, consolidated digests, and the website as separate layers.
- `new_frontier` is the dig mechanism. Without it, the system only drains seed links.
- Do not fork the engine for one topic. Adopt or resume existing folders with the same engine.
