# PARSENAL

Public Claude Code skill system by [@olegpars](https://github.com/olegpars). One plugin, three skills.

| Skill | What it does |
|---|---|
| `dreamteam` | One-shot multi-agent expert council for hard decisions: role personas, a verifier, an adversarial critic, a gap-fill round, synthesis into a single document. |
| `digger` | Autonomous multi-hour deep-research pipeline: scout council -> wave loop -> consolidation -> static knowledge-base site, with A/B/C/D confidence tiers on every claim. |
| `meaning` | Work out WHAT to say before choosing the form: extract meaning from material, generate meaning directions, audit a text/concept against its meanings, compare concepts, translate a meaning core into a format. |

## Install

```text
/plugin marketplace add olegpars/parsenal
/plugin install parsenal@parsenal
```

Both skills become available and trigger on their own phrases.

Manual install of a single skill (no marketplace): git clone https://github.com/olegpars/parsenal and copy the needed folder from `skills/` into `~/.claude/skills/` (Windows: `$env:USERPROFILE\.claude\skills\`).

## dreamteam

`dreamteam` is a one-shot multi-agent expert council skill. It turns one concrete question into a council run: a council of role personas (6-8 by default, 3-12 via modifiers) research in parallel, a verifier checks load-bearing claims, an adversarial critic attacks weak points, a gap-fill round closes important holes, and a synthesizer writes one decision document.

Dreamteam is built for focused decisions and fast understanding, not for ordinary brainstorming or exhaustive multi-hour research.

### What It Does

- Creates a self-contained brief from the current conversation and selected artifacts.
- Assigns expert personas with sharp, checkable questions.
- Runs council members in parallel with artifact reading and web research.
- Adds verification, adversarial critique, and targeted gap-fill.
- Produces a single markdown document under a relative output path such as `./councils/<slug>/dreamteam-<date>.md`.

### Modes

- `decision`: for "what should we do", option selection, strategy, risk, cost, and tradeoff analysis.
- `understanding`: for a fast map of a topic, facts, schools of thought, disputes, and practical implications.

### Modifiers

- `quick` or `smoke`: smaller council for a cheap test.
- `bigger`: more roles.
- `with preview`: return the proposed role list before the full run.
- `with verification`: enable verifier in understanding mode.
- `OUTPUT_LANG='ru'`: final document and agent outputs in Russian. Default is English.

### Requirements

- A host that supports Workflow scripts with `agent`, `parallel`, `phase`, `log`, and nested `workflow` for multidreamteam.
- Node.js for `engine/extract-doc.mjs`.
- Web tools available to workflow agents when current external facts matter.
- Write access to the chosen output directory.

### Files

- `skills/dreamteam/SKILL.md`: orchestration instructions.
- `skills/dreamteam/engine/dreamteam-template.js`: single council workflow template.
- `skills/dreamteam/engine/multidreamteam-template.js`: batch master workflow.
- `skills/dreamteam/engine/extract-doc.mjs`: fallback document extractor.
- `skills/dreamteam/references/unattended.md`: generic permission guidance for unattended runs.

## digger

`digger` is an autonomous multi-hour deep-research pipeline for Claude Code. It turns an explicit "dig deep into this topic" request into a reusable knowledge base: scout council -> wave loop -> consolidation -> static site.

Every claim is tagged with an A/B/C/D confidence tier, from primary-source evidence to weak folklore. Raw entries, consolidated digests, and the website remain separate so the result is both auditable and readable.

### Requirements

- Claude Code.
- A plan suitable for long multi-agent runs. Claude Max is recommended for full digs because waves can run for hours and touch many sources.
- A project directory where dig output can be written. By default, digger uses `./digs/<slug>/`.

### Quickstart

Ask for a focused dig:

```text
Dig deep into WebGPU debugging tools and build a knowledge base.
```

`digger` will:

1. Confirm the topic and mode.
2. Save output under `./digs/<slug>/` unless you choose another base.
3. Run scout to build a taxonomy and seed frontier.
4. Show the taxonomy before expensive waves begin.
5. Run research waves, process results on disk, and update the frontier.
6. Consolidate entries into subtopic and cross-cutting digests.
7. Build `dist/index.html`.

For long `full` runs, arm the supervised allowlist described in `skills/digger/references/unattended.md` before stepping away.

### Result Structure

```text
digs/<slug>/
|-- _meta/                 engine copies, manifest, taxonomy, frontier, state
|-- entries/               raw source notes, one file per researched source
|-- subtopics/             consolidated digest per subtopic
|-- cross-cutting/         consolidated cross-topic digests
|-- OVERVIEW.md            executive overview and comparison tables
|-- frontier.md            pending research queue
|-- sources.md             deduplicated source registry
|-- CHANGELOG.md           wave history
`-- dist/index.html        static knowledge-base site
```

### What Is Included

- `scout.js`: independent taxonomy proposals plus synthesis.
- `wave.js`: parallel research agents with source extraction and `new_frontier`.
- `process-wave.js`: deduplication, frontier update, source registry, and wave telemetry.
- `consolidation.js`: idempotent digest generation.
- `build-site.mjs`: single-file static site builder.
- `scripts/overnight.*` and `references/overnight-runner.md`: portable headless overnight runner for long `full` digs.

The public skill uses a supervised allowlist plus heartbeat for long runs. It does not include private runner infrastructure.

## meaning

`meaning` works out WHAT to say before choosing the form. A post, a script, an artwork concept, and an open-call application are treated as different renders of one underlying meaning construction, not separate tasks.

It is a conversational skill: no engine scripts, just SKILL.md plus reference files that Claude reads on demand.

### Modes

- `RESEARCH`: find a territory for an external brief (open call, venue, commission) before generating directions.
- `EXTRACT`: pull the meaning already present in a material without inventing anything.
- `GENERATE`: propose 3-5 meaning directions that differ by thesis, not phrasing.
- `AUDIT`: diagnose a finished text/concept against its meanings before proposing any edits.
- `SELECT`: compare 2+ directions with critique-before-scoring and an anti-homogenization check.
- `TRANSLATE`: render an approved Meaning Map into a target format via its adapter.

Every mode centers on a **Meaning Map** -- a structured card (subject, observation, tension, claim, stakes, audience_shift, embodiment, counter_reading, grounding, authorship) that must be shown and approved before any final text is written.

### Adapters

`skills/meaning/adapters/` covers paragraph/post, video script (reel/short), artwork concept/artist statement, and open-call application. Each adapter maps the generic Meaning Map fields onto format-specific checks.

### Files

- `skills/meaning/SKILL.md`: modes, the Meaning Map, the constitution, and hard rules.
- `skills/meaning/failure-modes.md`: a 12-mode catalog of meaning failures (pseudo-depth, hermetic drift, slop, and others), each with a procedural test.
- `skills/meaning/research-protocol.md`: the RESEARCH-mode protocol for external briefs.
- `skills/meaning/adapters/`: format-specific renders.
- `skills/meaning/memory/`: empty templates for a user's own recurring questions, rejected cliches, and approved meaning cards -- the skill can grow project memory over time, but ships with no prefilled entries.

## License

MIT
