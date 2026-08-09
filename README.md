# PARSENAL

Public Claude Code skill system by [@olegpars](https://github.com/olegpars). One plugin, five skills.

| Skill | What it does |
|---|---|
| `dreamteam` | One-shot multi-agent expert council for hard decisions: role personas, a verifier, an adversarial critic, a gap-fill round, synthesis into a single document. |
| `digger` | Autonomous multi-hour deep-research pipeline: scout council -> wave loop -> consolidation -> static knowledge-base site, with A/B/C/D confidence tiers on every claim. |
| `meaning` | Work out WHAT to say before choosing the form: extract meaning from material, generate meaning directions, audit a text/concept against its meanings, compare concepts, translate a meaning core into a format. |
| `worldbuilder` | Serial fictional worlds for short-form video: a world bible built file-by-file with HITL approval, canon evolution with conflict/retcon resolution, episode drafting, and read-only continuity checks. |
| `ogre` | Two-headed orchestration: Opus runs the pipeline and writes self-contained specs into GitHub issue bodies, a second model of a different architecture answers every non-trivial fork blind, and hands execute. |

## Install

```text
/plugin marketplace add olegpars/parsenal
/plugin install parsenal@parsenal
```

All five skills become available and trigger on their own phrases. Installed this way, Claude Code namespaces slash commands by plugin: use `/parsenal:meaning`, `/parsenal:worldbuilder` and `/parsenal:ogre` (not the bare `/meaning` / `/worldbuilder` / `/ogre` forms).

Manual install of a single skill (no marketplace): git clone https://github.com/olegpars/parsenal and copy the needed folder from `skills/` into `~/.claude/skills/` (Windows: `$env:USERPROFILE\.claude\skills\`). Only in this manual single-skill install do the bare `/meaning` / `/worldbuilder` / `/ogre` triggers apply.

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

## worldbuilder

`worldbuilder` is a conversational engine for developing serial fictional worlds for short-form video content (Reels/Shorts/TikTok with recurring creatures, locations, objects), built around a world bible format. It is generic -- not tied to any single world.

A world is a folder `worlds/<slug>/` in your working repo, created by copying the bible template bundled inside this skill (`skills/worldbuilder/template/`, kept file-by-file: creative constitution, world overview, creature/location/object records, episode architecture, a seriality checklist, an append-only continuity log).

### Modes

- `CREATE`: build a new world's bible file-by-file, starting with a mandatory call to the `meaning` skill for the meaning core, each file shown and approved before it is written.
- `EVOLVE`: check a proposed canon change against the existing bible, propose a conflict-free resolution or an explicitly labeled retcon, then write it plus a new continuity-log entry after approval.
- `STORY`: draft an episode from the world's bible and continuity log, using generators such as Sanderson's Third Law and an engagement loop; canon consequences require a separate explicit EVOLVE.
- `CHECK`: read-only compatibility check of an idea/text against the bible's immutable rules, iceberg markers, and continuity state.

The HITL boundary is absolute: nothing is written to a world's canon (bible file, record card, continuity log) before the user has explicitly approved that specific content.

### Files

- `skills/worldbuilder/SKILL.md`: modes, the HITL constitution, and hard rules.
- `skills/worldbuilder/template/`: the bundled world bible template CREATE copies from -- `README.md`, `00-creative-constitution.md`, `01-world-overview.md`, `02-records/` (creature/location/object cards), `03-episode-architecture.md`, `04-continuity-log.md`, `checklist-creature-series.md`.

## ogre

`ogre` is an orchestration mode: one head runs the pipeline, a second head of a **different architecture** answers every non-trivial fork blind, before it can be anchored by the first head's opinion. A single model is wrong exactly where it cannot see its own blind spots; two models of different architectures are wrong differently.

| Role | Who | What it does |
|---|---|---|
| Head 1 | Opus (the current session) | Runs the pipeline, writes self-contained specs into GitHub issue bodies, synthesizes, makes the final call. Has hands, inside explicit limits. |
| Head 2 | GPT-5.6-sol via Codex, read-only | Answers the fork **independently and blind** -- not a review of Opus's answer, its own answer. |
| Hands | Codex `--write`, headless Grok, Sonnet | Execution without judgement: coding and line-by-line review, scouting, `gh` operations, verification, acceptance. |

The blind protocol is the point: Opus states its own answer **first**, then sends the question with no hint of that answer, then synthesizes on the merits. A disagreement is always surfaced to the user as a line, never quietly resolved. Money, scope and irreversible actions form a **separate gate** that is not tied to whether the heads agree -- two models agreeing is an argument about correctness, not an authorization.

### What Is Actually Enforced

- **Issue-first.** One-line exception only, and only inside a file the user named -- the moment the diff grows or behaviour changes at a system boundary, an issue exists first.
- **Falsifiable DoD with a negative control.** A check that would also pass on the code *before* the change proves nothing and counts as "unverifiable".
- **Opus never accepts its own work.** A cross-model verification matrix: whoever wrote it does not sign it off.
- **Observation is not a verdict.** "Works", "checked it", "nothing broke" are banned in reports until a verifier line of the form `<model> ran <command> -> <fact>` exists.
- **A grounding gate for synthesis tasks.** A guide/summary/digest is cross-checked verbatim against the deepest source, not against a derived corpus.
- **A red-flag table** -- 25 specific rationalizations that surface under deadline, sunk cost and a filling context window, each paired with its counter.

### Requirements

- **Required for the second head and the coding hand:** the Codex plugin -- `/plugin marketplace add openai/codex-plugin-cc` -> `/plugin install codex@openai-codex` -> `/reload-plugins` -> `/codex:setup`. Without it the mode runs single-headed and marks every fork that went through without a second opinion.
- **Optional:** headless Grok (`grok.exe`, SuperGrok subscription) as a scout / second driver; an external terminal orchestrator for visible worker streams.
- A GitHub repo with `gh` available: issue bodies are where specs live, and the issue carries the whole acceptance machinery -- DoD, verifier, journal, closing comment.

### Files

- `skills/ogre/SKILL.md`: the mode -- limits on the head's hands, the second-opinion protocol, the money/scope gate, the pipeline, hand channels, the journal, the red-flag table.

### Lineage

Forked from a private predecessor mode built on the methodology of Sergey (serejaris)'s streams (agent map, cross-model verification, Grok as scout). Falsifiable DoD, the ban on "probably", stop-on-disagreement and the "noticed, didn't touch" rule are adapted from the Rigor Pack by Iwo Szapar. What ogre adds on top: the second head with its blind protocol, hands returned to Opus with explicit limits, and the separate money/scope gate.

## License

MIT
