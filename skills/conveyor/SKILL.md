---
name: conveyor
description: Use when the user explicitly asks to drive an issue map or epic to completion with subagents -- "conveyor #N", "drive map <repo>#N to the end", "finish the map", "run the conveyor on this epic". One dispatcher session takes an issue with sub-issues and drives it to its Destination in waves of parallel subagents. Pairs with a wayfinder-style map (github.com/mattpocock/skills) but accepts any issue with sub-issues. NOT for charting a new map and not for manual one-ticket-per-session continuation. Slash form is "/parsenal:conveyor" (bare "/conveyor" only applies to a manual single-skill install, see the PARSENAL README). Part of the PARSENAL skill system. User-invoked only -- do not auto-trigger.
disable-model-invocation: true
---

# conveyor — drive the map to the end

## Overview

A planning skill charts the map and stops. Conveyor is the continuation: one dispatcher session takes an issue with sub-issues and drives it to its Destination with waves of parallel subagents, each in an isolated context. The dispatcher itself executes no tickets — it only plans, launches waves, verifies, does the GitHub bookkeeping, and queues questions for the user.

## Input

- The map is addressed as `<owner>/<repo>#N`.
- A wayfinder map (label `wayfinder:map`) is a first-class input: Destination, blocked-by relations and ticket types (`wayfinder:research|prototype|grilling|task`) are read straight from the map.
- Any other issue with sub-issues works too: before starting, fill the gaps with a minimal grill — Destination in one question, plus marking tickets AFK vs human-only. Ask nothing else.

## The cycle (core)

1. **Frontier:** open sub-issues with no unresolved blocked-by, unclaimed, not `flag:human-only`.
2. **Opening plan (before the first wave only):** one message to the user — the frontier, AFK/HITL marking, model per ticket. This is a briefing, not a gate: the "drive it" command was already given — do not wait for confirmation.
3. **Wave:** up to 4 parallel subagents, one subagent = one ticket, isolated context. Claim each ticket before launch (see below). The executor prompt carries the ticket type and its resolution norm: research — facts with pointers to primary sources, a summary longer than ~10 lines goes into the repo as a file with a clickable GitHub link in the comment; prototype — a cheap artifact, link in the ticket; task — result as a comment.
4. **Verification:** every ticket is accepted by a separate verifier (never the executor) against the ticket's DoD; if the ticket has no DoD — against the ticket body. For external hands (Codex/Grok executors) acceptance is always a Claude subagent. The verifier's full report goes into the ticket as a comment; the dispatcher gets a one-line verdict (accepted or not + reason): the dispatcher accumulates context across waves, walls of reports crush it.
5. **Bookkeeping + map upkeep + self-check:** close accepted tickets, release claims, update blocked-by. Maintain the map (otherwise it stops being the index of decisions): a one-line gist with a link per accepted ticket under `## Decisions so far`; results that cleared fog spawn new tickets (create-then-wire) and prune `Not yet specified`; a decision that invalidated other tickets updates/closes them with a note; work that drifted past the Destination goes to `Out of scope`. Then a mandatory self-check of the GitHub bookkeeping: re-read issue numbers, repo and blocked-by and confirm everything landed in the TARGET repo (hard lesson: blocked-by links once leaked into someone else's public repos).
6. **Progress line in chat:** what closed, what got unblocked, what sits in the question queue.
7. Repeat until the frontier is empty. An empty frontier with open tickets left = only human-only/blocked remain → final.

## Claims and restart

- A claim = assignee + a marker comment `conveyor-claim <run-id> <timestamp ISO>` in the ticket.
- On run start: release stale claims of your own pattern (a `conveyor-claim` comment from a previous run-id) — re-running "conveyor #N" in a fresh session is idempotent, the state lives in GitHub, no duplicated work.
- **Restart instead of compaction.** When the dispatcher context approaches its limit or a major phase closes → do not compact: bring claims and the run journal in GitHub up to date (release your stale claims, update `wip:*` labels, append the journal), then end the session. Continuation is a fresh session with "conveyor #N": idempotency is already guaranteed by GitHub state. Auto-compaction is a safety net for a missed restart, not the standard way to continue a run.

## HITL — the question queue

- AFK tickets run always; grilling tickets produce questions into a queue.
- User present in the session → surface the queue one question at a time, with a recommendation; if an answer unblocks a new question — ask it right away.
- User away → do NOT wait: accumulate the queue, keep running AFK waves.
- Do not batch questions ahead of time: grilling tickets depend on each other through blocked-by.

## Gates

- Silent: GitHub operations (comments, closing tickets, editing the map body), files in the repo, local commits.
- **Push — one explicit "yes" from the user at the end of the run**, not earlier.
- External / irreversible / money (publishing, mailing, spending) — user only; never execute in the background: note it into the queue and wait.
- `flag:human-only` / "you publish it" — do not touch, only surface in the final summary.

## Models

- Mechanics (GitHub bookkeeping, claims, summaries) — cheap models.
- Content tickets (research conclusions, prototypes, texts) — the senior/session model.
- Code/mechanical tickets may go to external hands (Codex / Grok); acceptance is mandatory and always by a Claude subagent.
- The model↔ticket mapping goes into the opening plan; the user can override it.

## Final

A summary comment into the map (what's done, what remains human-only, the question queue) + the same summary in chat + a push offer (gate: one "yes").

## v1 boundaries

- No headless/night-runner and no auto-cron: conveyor lives while the session window is open.
- Do not modify or invoke the mapping skill for charting; manual one-ticket-per-session continuation is not conveyor.
- No product decisions inside tickets — those become grilling questions in the queue.
