# The spec, the envelopes, the journal, agent survivability

Read at the moment you write the spec and dispatch the first task.

## The issue body template

```markdown
**Goal:** one sentence — what is visible once it is accepted.

**Context:** files and lines, traps (duplicates, generated files, non-obvious
dependencies). Everything so THE EXECUTOR NEVER HAS TO INVESTIGATE ON ITS OWN.

**Contract:** exact formats at the boundaries — schemas, signatures, field names,
error codes. With example values, not descriptions in words.

**Roles:** executor · source of truth · verifier · who confirmed the DoD can fail.

**Diagram:** data flow / call order / 2+ components — mermaid in a fenced block.
ASCII art is forbidden.

**Resolved forks:** the decision plus one line of reasoning.

**Steps:** a numbered plan of edits, per file. The place to edit is addressed by an
anchor — a heading, a function name, a verbatim quote of the line. A line number is
not an address: it drifts after the first edit and the executor changes the wrong
place.

**Boundaries:** what NOT to do (no drive-by refactors, don't touch generated files).

**DoD + check:** an acceptance checklist where every item is a command and its
expected output verbatim (`pytest -q tests/x.py` → `2 passed`), not a description in
words ("make sure it works"). A check that cannot be run is not a DoD item. For a
behaviour change — the observable difference from before, not "it ran without
errors".
```

## The envelope for an executor

The issue body is self-contained, so the prompt is a short pointer:

```
You are the executor. Working directory: <path>.
Your spec is the body of issue #N: read `gh issue view N` and follow it exactly.
Do not step outside the spec, do not make product decisions.
When done: run the check from the DoD, one conventional commit with "(#N)" at the
end of the message. It is FORBIDDEN to write "closes #N"/"fixes #N" — GitHub will
auto-close the issue BEFORE the verifier accepts it. Do not close or comment on the
issue.
If reality contradicts the spec (a file is missing, the contract does not line up, a
step is impossible) — STOP: record the discrepancy and return a report, do not
improvise.
Report: files changed, result of the check, deviations from the spec, plus a
"Noticed, did not touch" section — adjacent problems outside the spec's boundaries,
left unfixed.
```

An executor without network access gets the spec as files inside the workspace
(`.tmp-issueN/spec.md` plus copies of the sources); the folder is excluded from the commit and deleted at
acceptance.

A spec that contradicts reality is a defect of the spec, not of the executor: the head edits the issue body and
re-dispatches. "Noticed, did not touch" is raw material for the pipeline — findings become new issues, not
retroactive edits.

## The readiness test for a spec

The original phrasing of the task dissolves into the "Goal": the issue body is rewritten from scratch.
**"Probably", "most likely", "apparently" are banned** — each one is either resolved before dispatch or becomes
a line under "Resolved forks".

- **Negative control.** A check that would also have passed before the edit checks nothing — that is
  "unverifiable". For a behaviour change the DoD names the observable difference from before, not "it ran
  without errors". Break the solution in your head and confirm the DoD command catches it.
- **Failability is not confirmed by the author of the DoD:** the verifier structurally cannot catch it — it
  runs the check, it does not review. Who confirms it defines the profile of the mode; the answer goes into the
  issue body before dispatch.

## Task ordering

By file overlap, not by the number of agents: a shared file → sequential; non-overlapping groups → parallel in
worktrees. A spec written ahead of time is reconciled line by line against the actual diff of the previous task
before dispatch.

## DoD requirements by class

- **A number (measurement, comparison, benchmark).** The author of the method cannot be the sole author of the
  reference value. Negative control happens before the number is promoted to a result; the outcome is
  reproduced by an independent executor — until then the number remains an **observation**.
- **Text synthesis.** The source is a transcript or the original, not a derived corpus and not a retelling.
  Verbatim reconciliation covers causal connectives, quantifiers, numbers and proper nouns **in full** — that
  is a class, not a sample. Derived-vs-derived does not count.
- **Media.** Reconciliation against the original brief and references, as a separate visual acceptance, headless
  only.

## Who verifies what

| Artifact produced by | Verified by |
|---|---|
| Codex (coding) | Sonnet runs the check from the DoD |
| the head itself (within its own hands) | Sonnet or Codex — by the class of the check |
| Grok (scouting, measurement) | Sonnet reproduces the number / re-checks the quotes |
| sol (judgement) | not verified: it is an opinion, not an artifact |

`gh` operations (journal, labels, closing) — the Sonnet hand: Codex sits in a sandbox with no network and `gh`
fails there.

## The failure ladder and closing

1. **Failure 1–2** — rework by the same executor with a pinpoint list, in the same thread.
2. **Failure 3** — a fresh executor with clean context plus the verifier's diagnosis.
3. **Failure 4** — stop on this task: label `blocked`, a short diagnosis to the user (what was tried, where it
   breaks, the hypothesis). The pipeline keeps moving on independent tasks.

Success is the only place anything gets closed:
`gh issue close N --comment "<SHA> — <the verifier's verdict in one line>"`. Do not touch the issue body: the
spec stays as the document of "what was ordered".

## The envelope for a verifier

```
You are the verifier. Working directory: <path>. You did not do this task and you
are not reviewing it.
Run the check from the DoD of issue #N (`gh issue view N`) against the artifact, not
against the report about it. Return: passed / failed / unverifiable here — what
exactly could not be run and why; WHAT you reconciled against (full path or URL);
what you saw with your own eyes. Do not fix, do not improve, do not extend.
Any browser check — headless only.
```

## The journal in the issue

Posted by the gh hand at every phase transition, verbatim — what was sent and what came back; a payload longer
than ~10 lines is wrapped in `<details>`.

| Transition | Line | Label |
|---|---|---|
| dispatch | `▶ dispatch → <channel>` + channel, model, flags, the full envelope | `wip:dispatched` |
| report | `↩ executor report → verifier` + the digest verbatim | `wip:verifying` |
| verdict | `✔ verifier: passed` / `✖ failed` — per DoD item: command → fact, not just the N/M count | — |
| rework | `🔁 rework N` + a pinpoint list | `wip:rework` |
| stop | `⛔ blocked: <diagnosis>` | `blocked` |
| reconciled against a non-source | — | `unverified:source` |
| acceptance | `<SHA> — <verdict in one line>` in the closing comment | — |

The journal never touches the issue body. Executors do not write in the issue — only the gh hand does. In
public repos, local paths and machine names are masked as `<local>`.

## Agent survivability

- **The scratchpad protocol (mandatory).** Every subagent writes its FULL report to
  `<session-scratchpad>/reports/<agent-name>.md` (the path is substituted into the prompt explicitly) and
  returns a digest of ≤15 lines plus the path in its final message. The digest is self-sufficient for
  judgement: quotes, numbers, verdicts — inline. Deciding "by pointer", without seeing the fact, is forbidden.
- **A lost report.** An idle notification with no final message — read the report file; fallback is
  `SendMessage(to: <agent>)`.
- **Death by session limit.** Respawn a successor with instructions to audit the traces: `git log`,
  `git status`, uncommitted files — partial work is often correct.
- **Browser checks are headless only.** The user is working in their own browser and stealing focus is not
  acceptable; the requirement goes into the prompt of every agent that does a visual check.
