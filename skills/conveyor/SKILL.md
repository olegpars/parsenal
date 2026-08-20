---
name: conveyor
description: >-
  Use when the user tells you to drive an issue map or epic to completion with subagents -- "drive the map <repo>#N", "drive the map to the end", "run the conveyor on #N", "conveyor #N", "finish the epic #N". One dispatcher session takes an issue with sub-issues and drives it to its Destination in waves of parallel subagents with isolated contexts. NOT for charting a new map and NOT for the manual one-ticket-per-session flow; deep topic research is digger, a one-shot expert council is dreamteam. Slash form is "/parsenal:conveyor" (bare "/conveyor" only applies to a manual single-skill install, see the PARSENAL README). Part of the PARSENAL skill system. User-invoked only -- do not auto-trigger.
disable-model-invocation: true
---

# Conveyor -- the dispatcher that drives an issue map to Done

## Overview

A map-charting skill (wayfinder-style) charts the map and stops. Conveyor continues from there: one dispatcher session takes an issue with sub-issues and drives it to its Destination through waves of parallel subagents with isolated contexts. The dispatcher does not execute tickets itself -- it only plans, runs waves, verifies, maintains GitHub wiring, and asks the user questions.

## Input

- Address the map as `<owner>/<repo>#N`. If no repo is given, use the repo of the current working directory; ask if that is ambiguous.
- If the map was charted with wayfinder-style labels, treat `wayfinder:map` as a first-class data format: read the Destination, blocked-by links, and ticket types (`wayfinder:research|prototype|grilling|task`) from the map.
- For any other issue with sub-issues, fill only the missing essentials before starting: ask one question for the Destination and classify tickets as AFK or human-only. Ask nothing else.

## The loop (the core)

1. **Frontier:** open sub-issues with no unresolved blocked-by links, no active claim, and no `flag:human-only`.
2. **Starting plan (only before the first wave):** send the user one message with the frontier, the AFK/HITL classification, and the model assigned to each ticket. This is a briefing, not a gate: the command to drive the map has already been given, so do not wait for confirmation.
3. **Wave:** launch up to 4 parallel subagents, one ticket per subagent, each with an isolated context. Claim every ticket before launch (see below). Give the executor the ticket type and, if the map was charted with wayfinder-style labels, the resolution standard for that type: research -- facts with primary-source pointers, with summaries longer than ~10 lines saved as a repository file and linked from a comment; prototype -- a cheap artifact linked from the ticket; task -- the result in a comment.
4. **Verification:** a separate verifier, never the executor, accepts each ticket against its DoD; if the ticket has no DoD, verify against the ticket body. For external hands, acceptance is always done by a separate in-session verifier agent. Put the verifier's full report in a ticket comment; return only a one-line verdict to the dispatcher (accepted/rejected plus the reason). The dispatcher accumulates context wave by wave, so full reports will exhaust it.
5. **Wiring + map + self-check:** close accepted tickets, remove claims, and update blocked-by links. Maintain the map after every accepted ticket (a wayfinder-style rule; without it, the map stops being a decision index): add a one-line gist with a link under `## Decisions so far`; if the result cleared uncertainty, create new tickets before wiring them in and clean up `Not yet specified`; if a decision invalidated other tickets, update or close them with a note; if a ticket proved beyond the Destination, move it to `Out of scope`. Then self-verify all GitHub wiring: reread issue numbers, repos, and blocked-by links and confirm that everything landed in the TARGET repo (hard-won rule: in one real run, blocked-by links silently landed in unrelated public repos).
6. **Progress line in chat:** state what closed, what became unblocked, and what entered the question queue.
7. Repeat until the frontier is empty. An empty frontier while tickets remain open means only human-only or blocked tickets remain -- move to the finale.

## Claims and restart

- A claim is an assignee plus the marker comment `conveyor-claim <run-id> <timestamp ISO>` in the ticket.
- At the start of a run, remove stale claims made with the same pattern (a `conveyor-claim` comment from a previous run-id). A fresh-session request to drive the same map is idempotent: state lives in GitHub and work is not duplicated.
- **Restart instead of compaction.** As the dispatcher's context approaches its auto-compact ceiling (~300k tokens in current Claude Code), or after a large phase of the run closes, do not compact. Bring claims and the GitHub journal current: remove your stale claims, update `wip:*` labels, finish the Conveyor journal, then end the session. Continue in a fresh session with the same request to drive the map. GitHub state already guarantees idempotency, so no context reconstruction is needed. Global auto-compaction is insurance for a missed restart, not the normal continuation mechanism.

## HITL -- the question queue

- AFK tickets always keep running; grilling tickets add questions to the queue.
- When the user is present, present questions one at a time, each with a recommendation. If an answer unlocks a new question, ask it immediately.
- When the user is away, do not wait: accumulate the queue and continue AFK waves.
- Do not batch questions in advance; grilling tickets depend on one another through blocked-by links.

## Gates

- Do without asking: GitHub operations (comments, ticket closure, map-body edits), repository files, and local commits.
- **Push requires one explicit yes from the user at the end of the run**, never earlier.
- External, irreversible, or paid actions (publication, outbound messages, spending) are for the user only. Never perform them in the background: add a note to the queue and wait.
- Do not touch `flag:human-only` tickets or actions marked "you publish"; only highlight them in the finale.

## Models

- Mechanical work (GitHub wiring, claims, summaries) -- use a cheaper model such as Sonnet.
- Content tickets (research conclusions, prototypes, copy) -- use the senior or session model.
- Coding and mechanical tickets may go to external hands (Codex CLI, headless Grok); acceptance is mandatory and is always done by a separate in-session verifier agent.
- Put the model-to-ticket mapping in the starting plan; the user may revise it.

## Finale

Post a summary comment on the map covering what was done, what remains human-only, and the question queue. Give the same summary in chat, then propose a push (gate: one explicit yes).

## v1 boundaries

- No headless/night runner and no automatic cron: Conveyor lives only while the session window is open.
- Do not modify a map-charting skill or invoke one to chart a map. "Continue the map #N" belongs to the manual one-ticket-per-session flow, not Conveyor.
- Do not make product decisions inside tickets; add them to the queue as grilling questions.
