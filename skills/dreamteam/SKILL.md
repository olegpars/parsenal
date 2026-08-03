---
name: dreamteam
description: Use when the user wants a one-shot multi-agent expert council on a hard decision or an unfamiliar topic — phrases like "convene a council", "get expert takes on X", "stress-test this decision from multiple angles", "dreamteam on X". Part of the PARSENAL skill system. Not for multi-hour exhaustive topic research (that is digger).
---

# dreamteam

You are the orchestrator. Your job is to collect enough context, fill an engine template, start one Workflow run, and later return a compact TLDR from the final document. The council inside the workflow does the expert work.

Use it for one focused pass over a concrete question, not for open-ended research programs.

## Core Shape

The workflow is fixed unless the user explicitly asks to modify the skill itself:

Opus brief architect -> Opus assignment designer -> Sonnet expert personas in parallel -> Opus verifier plus Sonnet adversarial critic -> Sonnet gap-fill round -> Opus synthesizer writes the document.

Opus opens and closes the work. Sonnet digs. The normal cost shape is about 0.5-1.5M subagent tokens and 15-40 minutes.

## Modes

- `decision`: use when the user needs to choose what to do, compare options, set strategy, or resolve tradeoffs.
- `understanding`: use when the user wants a fast map of a topic, facts, schools of thought, disputes, and practical implications.

Infer the mode from the user's phrase. If the mode is genuinely unclear and changes the output, ask one short question. If the user actually needs exhaustive multi-hour knowledge-base excavation, do not run dreamteam; route them to a deeper research workflow if available.

## Kickoff

Ask the minimum needed, one question at a time.

1. Build a self-contained `RAW_CONTEXT_JSON`: goal, what matters most, constraints, already-made decisions, things not to reopen, the user's own wording, and relevant recent conversation context.
2. Infer topic and mode from the conversation. Do not re-ask what is already clear.
3. Scan the recent conversation for mentioned files, screenshots, and paths. If found, ask for one-click confirmation of the concrete artifact list. If none are mentioned, use `[]`.
4. Save output under a relative project path by default, for example `./councils/<slug>/dreamteam-<YYYY-MM-DD>.md`. Show the path in one line and let the user correct it.

Scale and preview come only from modifiers in the user's phrase:

- "bigger" -> `ROLES_MIN=9`, `ROLES_MAX=12`.
- "quick" or "smoke" -> `ROLES_MIN=3`, `ROLES_MAX=4`, smaller `CLARIFY_CAP`.
- "with preview" -> `PREVIEW=true`.
- `decision` always uses `VERIFY=true`.
- `understanding` defaults to `VERIFY=false`; "with verification" changes it to `true`.

`OUTPUT_LANG` controls the document language. Use `'en'` by default. Use `'ru'` when the user explicitly wants Russian.

## Run

1. Read `engine/dreamteam-template.js`.
2. Replace every placeholder in the template:
   - `{{TOPIC_SLUG}}`: short ASCII slug for workflow metadata.
   - `{{TOPIC_TITLE}}`: short title without quotes or backticks.
   - `{{MODE}}`: `decision` or `understanding`.
   - `{{OUTPUT_LANG}}`: `en` or `ru`.
   - `{{PREVIEW}}`: `true` or `false`.
   - `{{ROLES_MIN}}`, `{{ROLES_MAX}}`: role count bounds.
   - `{{VERIFY}}`: `true` or `false`.
   - `{{CLARIFY_CAP}}`: maximum gap-fill tasks.
   - `{{DATE}}`: current date in `YYYY-MM-DD`.
   - `{{RAW_CONTEXT_JSON}}`: `JSON.stringify` string with a self-contained context dump.
   - `{{ARTIFACTS_JSON}}`: JSON array of absolute or project-relative artifact paths, or `[]`.
   - `{{OUT_PATH_JSON}}`: JSON string for the output document path.
3. Start `Workflow { script: <filled template text> }`.
4. Keep `runId` and `scriptPath` from the response for preview resume, crash recovery, and later extraction.
5. Tell the user it is running, give the 15-40 minute ETA, and do not wait silently.

The only approval in the normal path is the Workflow start. Do not move web research, artifact reading, or synthesis out of the workflow unless there is a hard failure.

## Preview Gate

With `PREVIEW=true`, the workflow returns after assignment design with `{ stage: 'preview', brief, assignments }`.

Show the role list: role, persona in one line, and 1-2 sharp questions. If the user edits it, patch the persisted `scriptPath` by adding the user's requirements to the assignment-designer prompt and switch `const PREVIEW = parseBoolPlaceholder(...)` input from `true` to `false`. Resume with `Workflow { scriptPath, resumeFromRunId }`.

Do not edit a generated draft assignment object directly; change the prompt so the workflow can regenerate the assignment phase.

## Completion

1. The synthesizer writes the document to `OUT_PATH`.
2. Verify that `OUT_PATH` exists and is not empty.
3. If the file was not written, use the fixed extractor:
   `node "<SKILL_DIR>/engine/extract-doc.mjs" "<task-output.json>" "<OUT_PATH>"`
4. Read the document itself. Avoid pulling the whole workflow output into context unless needed.
5. Return a TLDR: main conclusions, contested points, and open questions from the document. Ask open questions one at a time if user answers are needed.

## Multidreamteam

Use multidreamteam when the user gives several topics and wants one approval for the batch.

1. Collect each topic with its mode, artifacts, and output path.
2. Fill `engine/dreamteam-template.js` for each topic and save each child script under a local batch directory.
3. Fill `engine/multidreamteam-template.js`:
   - `{{BATCH_SLUG}}`
   - `{{BATCH_TITLE}}`
   - `{{CHILDREN_JSON}}`: `[{ "name": "...", "scriptPath": "..." }]`
   - `{{PARALLEL}}`: default `false`; use `true` only when speed is more important than quota pacing.
4. Start one Workflow on the master script.

Platform limitation: nesting is one level. Child dreamteam scripts must not call `workflow()`.

## Red Flags

- If you want to ask three kickoff questions at once, stop and ask only the next blocking question.
- If you want to pass context through Workflow args, stop; bake it into the script.
- If you want to read the whole task output file for the final document, stop; run the extractor first.
- If the user asked only for brainstorming, do not run dreamteam.
- If the user asked for exhaustive "everything to the bottom" research, do not run dreamteam.
- Do not silently change the model split for cost reasons.
