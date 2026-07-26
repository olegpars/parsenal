# Parsival

Public Claude Code skill system by [@olegpars](https://github.com/olegpars). One plugin, three skills.

| Skill | What it does |
|---|---|
| `parsival-seedance` | Director-grade YAML storyboard prompts for ByteDance Seedance 2.0: timestamped multi-shot, character modeling, reference-image anti-drift discipline. |
| `parsival-brigada` | One-shot multi-agent expert council for hard decisions: role personas, a verifier, an adversarial critic, a gap-fill round, synthesis into a single document. |
| `parsival-kopatel` | Autonomous multi-hour deep-research pipeline: scout council -> wave loop -> consolidation -> static knowledge-base site, with A/B/C/D confidence tiers on every claim. |

## Install

```text
/plugin marketplace add olegpars/parsival
/plugin install parsival@parsival
```

All three skills become available and trigger on their own phrases.

Manual install of a single skill (no marketplace): git clone https://github.com/olegpars/parsival and copy the needed folder from `skills/` into `~/.claude/skills/` (Windows: `$env:USERPROFILE\.claude\skills\`).

## parsival-seedance

Skills for AI video creators, built for Claude Code and compatible agent runtimes. Battle-tested on real production work.

Director-grade YAML prompter for ByteDance Seedance 2.0: timestamped multi-shot storyboards, character modeling blocks, reference-image anti-drift discipline, genre presets, platform-aware length budgeting.

Requirements:

- Claude Code (or any runtime that supports SKILL.md-format agent skills)
- A Seedance 2.0 access point (Dreamina, Jimeng, CapCut, or API) to run the generated prompts

## parsival-brigada

`parsival-brigada` is a one-shot multi-agent expert council skill. It turns one concrete question into a council run: a council of role personas (6-8 by default, 3-12 via modifiers) research in parallel, a verifier checks load-bearing claims, an adversarial critic attacks weak points, a gap-fill round closes important holes, and a synthesizer writes one decision document.

Brigada means "brigade" or "crew". It is built for focused decisions and fast understanding, not for ordinary brainstorming or exhaustive multi-hour research.

### What It Does

- Creates a self-contained brief from the current conversation and selected artifacts.
- Assigns expert personas with sharp, checkable questions.
- Runs council members in parallel with artifact reading and web research.
- Adds verification, adversarial critique, and targeted gap-fill.
- Produces a single markdown document under a relative output path such as `./councils/<slug>/brigada-<date>.md`.

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

- A host that supports Workflow scripts with `agent`, `parallel`, `phase`, `log`, and nested `workflow` for multibrigada.
- Node.js for `engine/extract-doc.mjs`.
- Web tools available to workflow agents when current external facts matter.
- Write access to the chosen output directory.

### Files

- `skills/parsival-brigada/SKILL.md`: orchestration instructions.
- `skills/parsival-brigada/engine/brigada-template.js`: single council workflow template.
- `skills/parsival-brigada/engine/multibrigada-template.js`: batch master workflow.
- `skills/parsival-brigada/engine/extract-doc.mjs`: fallback document extractor.
- `skills/parsival-brigada/references/unattended.md`: generic permission guidance for unattended runs.

## parsival-kopatel

`parsival-kopatel` is an autonomous multi-hour deep-research pipeline for Claude Code. It turns an explicit "dig deep into this topic" request into a reusable knowledge base: scout council -> wave loop -> consolidation -> static site.

Every claim is tagged with an A/B/C/D confidence tier, from primary-source evidence to weak folklore. Raw entries, consolidated digests, and the website remain separate so the result is both auditable and readable.

### Requirements

- Claude Code.
- A plan suitable for long multi-agent runs. Claude Max is recommended for full digs because waves can run for hours and touch many sources.
- A project directory where dig output can be written. By default, kopatel uses `./digs/<slug>/`.

### Quickstart

Ask for a focused dig:

```text
Dig deep into WebGPU debugging tools and build a knowledge base.
```

`parsival-kopatel` will:

1. Confirm the topic and mode.
2. Save output under `./digs/<slug>/` unless you choose another base.
3. Run scout to build a taxonomy and seed frontier.
4. Show the taxonomy before expensive waves begin.
5. Run research waves, process results on disk, and update the frontier.
6. Consolidate entries into subtopic and cross-cutting digests.
7. Build `dist/index.html`.

For long `full` runs, arm the supervised allowlist described in `skills/parsival-kopatel/references/unattended.md` before stepping away.

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

## License

MIT
