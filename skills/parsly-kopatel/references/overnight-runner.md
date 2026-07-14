# Overnight Runner

This guide describes Recipe B for a headless overnight kopatel dig. Use it when a `full` dig is expected to run for hours and nobody will be present to approve prompts.

Recipe B is intentionally small and portable. The runner does not create git worktrees, does not push, and does not depend on private infrastructure. The dig lives in the user's project, normally under `./digs/<slug>/`.

## Why Headless

`claude --print` is a different operating mode from an interactive session: there is physically nobody to ask. That is the point of an overnight run. It should have zero permission prompts by construction, and transient service failures or rate limits are handled by retrying later instead of waiting for a human.

The default command used by the scripts is:

```bash
claude --print --permission-mode acceptEdits
```

You can replace it with another CLI agent by passing the runner's `AgentCmd` option.

## Runner Contract

Create a static `GOAL.md` and run one agent pass per iteration. The agent reads the same goal every time, checks current files, performs one bounded step, and appends progress to `STATUS.md`.

Run the runner with the work directory set to the dig folder (`<DIG>`): `STATUS.md`, `.done` and `.blocked` live there, and the GOAL template below assumes it.

The mutable files are:

- `STATUS.md`: append-only status and iteration notes.
- `.done`: success sentinel in the run directory.
- `.blocked`: blocked sentinel in the run directory.
- `logs/iter-N.log`: stdout and stderr for each agent iteration.

Terminal behavior:

- `.done` or a `DONE:` line in `STATUS.md` exits with code `0`.
- `.blocked` or a `BLOCKED:` line in `STATUS.md` exits with code `2`.
- Repeated agent failures append `FAILED:` to `STATUS.md` and exit with code `1`.
- Exhausting `MaxIterations` exits with code `3`.

Run from PowerShell:

```powershell
.\.claude\skills\kopatel\scripts\overnight.ps1 -Goal .\GOAL.md -WorkDir . -MaxIterations 40
```

Run from bash:

```bash
.claude/skills/kopatel/scripts/overnight.sh --goal ./GOAL.md --work-dir . --max-iterations 40
```

## Pre-Flight

Before the loop starts, the runner performs a pre-flight smoke:

```bash
echo hi | claude --print --permission-mode acceptEdits
```

If this fails, stop. Common causes are expired CLI authentication, a missing login, or a workspace trust dialog that has not been accepted. For a `401`, re-login with the CLI interactively, then rerun the same smoke before starting the overnight job.

## Permissions

In headless mode, an unlisted permission is a silent deny, not a prompt. Do not assume the agent will ask for approval later. The project `settings.json` needs both an allow list and a deny list that match the intended dig.

Example armed allow list for a kopatel dig:

```json
{
  "permissions": {
    "allow": [
      "Agent",
      "Workflow",
      "WebSearch",
      "WebFetch",
      "ToolSearch",
      "Glob",
      "Grep",
      "Bash(node:*)",
      "Write(./digs/**)",
      "Edit(./digs/**)"
    ],
    "deny": [
      "Bash(git push:*)",
      "Bash(rm -rf:*)",
      "Write(../**)",
      "Edit(../**)"
    ]
  }
}
```

Adjust the `./digs/**` path if the dig output lives somewhere else. Keep publishing and broad filesystem access out of the overnight permissions.

## Trust

Accept the workspace trust dialog before the headless run. Do it interactively in the same project directory. If trust has not been accepted, the CLI can ignore the configured `permissions.allow` entries and the headless run will behave as if the tools were denied.

## Parallelism

Do not start more than three headless workers at the same time. Large cold starts can stampede the CLI, quota, or local machine. Start jobs in a small batch, wait for logs and disk artifacts to appear, then start the next batch.

## Morning Verification

Do not trust `STATUS.md` on its own. A headless agent can fabricate a DONE report or skip a check while still writing a confident summary. In the morning, verify the dig with a fresh agent or by directly inspecting the files, running the Node processing commands, and opening the generated site.

Check artifacts first:

- Latest `frontier-wN.json`.
- `CHANGELOG.md` and `frontier.md`.
- New entries and sidecar JSON files.
- `dist/index.html` after the site build.

## GOAL Template

Use this GOAL template as a starting point. Replace `<DIG>` and `<slug>` before launch.

```md
# kopatel overnight wave for <slug>

You are running one unattended kopatel wave per iteration.

## Scope

- Dig directory: `<DIG>`
- Work only inside `<DIG>` unless this GOAL explicitly says otherwise.
- Do not publish, push, or change unrelated project files.

## Procedure For This Iteration

1. Read `<DIG>/_meta/dig.json`, `STATUS.md` if present, and the latest `<DIG>/_meta/frontier-wN.json`.
2. If the latest frontier is empty, append `DONE: <slug>` to `STATUS.md`, create `.done` in the runner work directory, and stop.
3. Run one wave workflow from `<DIG>/_meta/wave.js`.
4. Persist the wave result under `<DIG>/_meta/wave-<N>-out.json`.
5. Process the wave with `node "<DIG>/_meta/process-wave.js" "<DIG>/_meta/wave-<N>-out.json" <N>`.
6. Read the short processing report and the next `frontier-w<N+1>.json`.
7. Append a concise iteration note to `STATUS.md`: wave number, entries written, sources touched, frontier size, errors, and next action.
8. If blocked by missing files, broken permissions, repeated command failure, or an ambiguous state, append `BLOCKED: <reason>` to `STATUS.md`, create `.blocked` in the runner work directory, and stop.

## Rules

- One wave per iteration.
- Keep large outputs on disk, not in the chat context.
- Preserve A/B/C/D confidence tiers.
- Prefer retryable, idempotent work. If an agent crash leaves no sidecar for a target, leave that target in the frontier for the next wave.
- Do not consolidate overnight. Consolidation and publishing are morning review tasks.
```

Advanced users can wrap the same contract in worktrees or a detached process manager, but that is outside the portable v1 runner.
