# Unattended Runs

Brigada is designed for one approval at launch. In stricter harnesses, the platform can still ask for approvals on orchestration calls such as Workflow, Agent, web tools, file writes, node extraction, or repository commands.

The correct fix is an armed allowlist configured by the user or administrator. The skill must not grant itself permissions, edit global settings, or prepare a bypass.

## Generic Allowlist Shape

Allow only the tools the runner needs:

```json
"Workflow",
"Agent",
"ToolSearch",
"WebSearch",
"WebFetch",
"TaskCreate",
"TaskUpdate",
"TaskList",
"TaskGet",
"ScheduleWakeup",
"Bash(node:*)",
"Bash(git add:*)",
"Bash(git commit:*)",
"Bash(git status:*)",
"Bash(git diff:*)",
"Bash(git log:*)",
"PowerShell(node:*)",
"PowerShell(git add:*)",
"PowerShell(git commit:*)",
"PowerShell(git status:*)",
"PowerShell(git diff:*)",
"PowerShell(git log:*)",
"Write(<workspace>/councils/**)",
"Edit(<workspace>/councils/**)",
"Edit(<agent-project-state>/**)"
```

Add push or hosting commands only when the local operational policy allows them. An allowlist removes prompts; it does not change behavioral policy.

## Ways To Apply

1. Add the rules manually in the platform permissions settings.
2. On the first run, approve each required call with an "always allow" option if the platform provides it.
3. Use the platform permissions UI if available.

## Verification

Zero prompts can only be verified by a live smoke run on a cheap topic. If any call asks for approval, add the missing narrow rule and rerun.

## Multiple Machines

Use paths appropriate to each machine. Do not put machine-specific absolute paths in the public skill.
