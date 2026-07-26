# Heartbeat

Heartbeat is a supervised crash-recovery backstop for long interactive `full` digs. It exists because a wave can fail silently: no useful output and no completion notification. The normal chain stops, but the frontier on disk still says what should happen next.

Heartbeat is useful only after permissions are armed. If the harness still asks for approval on each wave, the loop will stop at the prompt before heartbeat can help. Use `references/unattended.md` first.

## Principle

Heartbeat is TaskList-aware. It does not start work blindly on a timer. On each wakeup, it checks whether a relevant workflow is already running and whether the frontier still has pending work.

## Tools

- `ScheduleWakeup` schedules the next check in the same skill context.
- `TaskList` and `TaskGet` check whether scout, wave, or consolidation is currently running.

Load tool schemas with ToolSearch when needed.

## Decision Tree

```text
1. Is a kopatel scout, wave, or consolidation workflow running?
   - Yes: do nothing except schedule the next heartbeat, then exit.
   - No: continue.

2. Find the newest <DIG>/_meta/frontier-w<N>.json.
   - Pending items exist and frontier-w<N+1>.json does not exist:
     restart wave N, process it, commit if applicable, schedule the next heartbeat, then exit.
   - Pending is empty:
     the frontier is dry. Stop heartbeat and move to consolidation/site.
   - User stop, mode cap, or budget cap is reached:
     stop heartbeat.
```

The "already processed" check must use disk state. If `frontier-w<N+1>.json` exists, wave N was processed and must not be duplicated.

## Interval

Use 20-30 minutes (`1200-1800` seconds). A wave can take many minutes, and the goal is to avoid multi-hour stalls rather than react instantly.

For service throttling or long cooldowns, schedule a longer wakeup and resume later. Do not hammer retries.

## Shutdown

When the dig is complete or the user says stop, do not schedule another wakeup. If stale scheduled checks exist from earlier runs, list and remove them with the relevant scheduling tools.
