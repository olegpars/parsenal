# Adopt Existing Research

kopatel is one engine. If a useful research folder already exists, do not fork a second engine for it. Adopt the folder, attach kopatel's `_meta` scripts, and continue from disk state.

`--adopt` overwrites only engine copies in `_meta/` and creates missing standard directories. It does not delete entries, digests, taxonomy, frontier, seen targets, or sources.

```bash
node "<SKILL_DIR>/engine/init-dig.mjs" "<topic>" "<slug>" "<base-where-base/slug-is-the-existing-folder>" --adopt
```

## Required Shape

For smooth adoption, the folder should have:

1. `_meta/taxonomy.json`
2. `entries/`
3. `subtopics/`
4. `cross-cutting/`

If the old folder uses a different digest directory name, rename it once to `subtopics/` instead of adding branches to the engine.

## Taxonomy

If `_meta/taxonomy.json` is missing, build it from the existing folder's own structure and docs. Do not invent a new taxonomy from memory.

Use this shape:

```json
{
  "topic": "...",
  "slug": "...",
  "groups": [{"id":"main","label":"Main"}],
  "subtopics": [
    {"slug":"example","title":"Example","group":"main","globs":["*example*","*.example.*"]}
  ],
  "crosscutting": [
    {"slug":"risks","title":"Risks","grep":"risk|failure|limit"}
  ],
  "site": {
    "eyebrow":"Research base",
    "brand":"Knowledge Base",
    "brand_sub":"Deep research",
    "title":"Research Knowledge Base",
    "tagline":"Evidence-ranked notes and digests.",
    "foot":"Built with kopatel"
  }
}
```

Entry filenames do not need to be renamed if `globs` cover them. New kopatel entries use `<id>.<subtopic_slug>.<short>.md`.

## Procedure

1. Inspect the existing folder and identify entries, digests, and any old taxonomy-like arrays or docs.
2. Create or repair `_meta/taxonomy.json`.
3. Run `init-dig.mjs --adopt`.
4. Run `build-site.mjs` to verify the adopted taxonomy points to real digests.
5. Resume from the latest non-empty `frontier-wN.json`, or bump `CONSOLIDATION_LABEL` and reconsolidate.

The goal is to conform the folder to kopatel once, then keep the engine simple.
