# Hard Lessons

These lessons come from the reference dig (12 waves -> 422 entries -> 1645 sources -> 31 digests -> a static site). They are the reason the pipeline is shaped this way.

## 1. Workflow Args Are Not Reliable State

Workflow arguments can arrive stringified or absent. If critical state depends on `args`, defaults can silently win and rerun the wrong wave.

Fix: scripts are self-locating. `init-dig.mjs` copies the engine into `<DIG>/_meta/` and bakes the dig path, topic, and slug into those copies. Wave number and frontier state are read from disk.

## 2. Schema-Free Agents For File Artifacts

Agents that write long files can fail to complete a structured return. If the artifact is the file, use schema-free agents: write the file and return a short confirmation.

Use schemas only for small or medium returns, such as wave entry summaries and scout council proposals.

## 3. Throttling Requires Idempotence

Long parallel work can hit temporary service throttling. The answer is not aggressive retries.

Fix: small consolidation batches, skip-if-done labels, disk state, and restartable phases. Wait, then resume.

## 4. Silent Crashes Need Heartbeat

A wave can die with no useful output and no completion event. The chain stops while the frontier still has work.

Fix: ScheduleWakeup heartbeat that checks TaskList and disk state. If nothing is running and the live frontier is unprocessed, restart that wave. If the frontier is dry, stop.

## 5. Persist After Every Wave

Wave output is valuable and may represent many sources. Commit after each wave when the dig lives in a Git repo. At minimum, ensure all output is on disk before starting the next wave.

## 6. `new_frontier` Is The Digging Mechanism

Every research agent should return items it discovered but did not cover. Without `new_frontier`, the loop only drains the seed list.

## 7. Dedup Happens Twice

- Research agents avoid writing obvious duplicate entries.
- `process-wave.js` normalizes targets, updates `seen.json`, and removes already-seen targets from future frontier files.

## 8. Model Split Is Deliberate

Page extraction uses Sonnet for breadth. Scout and consolidation use Opus for synthesis and deduplication. State the split instead of changing it silently.

## 9. Process Large Output Through Node

The orchestrator writes wave output to `<DIG>/_meta/wave-<N>-out.json` and runs `process-wave.js`. Heavy deduplication, source merging, and markdown rendering happen on disk instead of in the orchestrator context.

## 10. Keep Three Output Layers

- `entries/`: raw audit trail, one source per file.
- `subtopics/` and `cross-cutting/`: consolidated product.
- `dist/`: static site for reading and sharing.

Do not collapse these layers. Auditability and readability are separate needs.

## 11. Long Sessions Still Accumulate Context

Even a thin orchestrator spends context writing wave results to disk. After many waves, consolidate, persist state, and continue in a compacted or fresh session.

## Open Improvements

- A critic/broadening wave can reseed thin subtopics after the frontier dries.
- Letting research agents persist fully structured wave output directly is tempting, but must be tested carefully to avoid corrupting JSON. The current file handoff is conservative.
