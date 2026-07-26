# Unattended Supervision

Long `full` digs need permissions prepared before the user steps away. The public kopatel path is Recipe A: a supervised allowlist plus heartbeat. The skill cannot grant permissions to itself; the user applies the allowlist.

## Problem

In an interactive harness, wave orchestration can prompt for approval on each workflow call, Node processing step, Git command, or file write. If nobody is present, the chain stops at the first prompt.

This is a harness permission issue, not a script issue. Heartbeat can decide what should run next, but it cannot bypass approval prompts.

## Recipe A: Armed Allowlist

Allow only the tools needed by the dig loop. Anything outside the list still prompts and waits, which is the guardrail.

Add rules like these to `<project>/.claude/settings.local.json` or `<home>/.claude/settings.json`, adjusted to your local dig base:

```json
{
  "permissions": {
    "allow": [
      "Workflow",
      "ScheduleWakeup",
      "TaskList",
      "TaskGet",
      "WebSearch",
      "WebFetch",
      "ToolSearch",
      "Glob",
      "Grep",
      "Bash(node:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git rev-parse:*)",
      "Write(<project>/digs/**)",
      "Edit(<project>/digs/**)"
    ]
  }
}
```

Do not include `git push`. A dig may accumulate local commits, but publishing is a separate explicit decision.

## Ways to Apply

1. Edit the settings file by hand.
2. Approve each command type once during a supervised first wave and choose the "always allow" option.
3. Use a configuration helper skill to add the same rules.

Keep the default permission mode unchanged. Only the dig-specific loop should be pre-approved.

## Smoke Test

Before a long `full` run:

1. Arm the allowlist.
2. Run two supervised waves on a throwaway topic.
3. Confirm there are no approval prompts for Workflow, Node processing, writes under `<project>/digs/**`, or local Git commits.
4. If a prompt appears, add the missing allow rule and repeat.
5. Start the real `full` run only after a clean smoke.

Heartbeat is described in `references/heartbeat.md`.

## Recipe B: Headless Overnight Runner

For a no-prompt overnight run, use `references/overnight-runner.md` and the bundled `scripts/overnight.*` runner.
