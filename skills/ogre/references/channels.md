# Channels: commands and field-tested constraints

Read before the first call to a channel in a session. Half of this mode's failures are a forgotten flag rather
than an error of judgement: both gotchas below (`--write`, `--always-approve`) were already written down and
still cost whole runs, because they sat in a text that had been read an hour earlier.

## Codex — the second head (sol)

Precondition, once per session, run by Opus itself, read-only Bash:

```bash
CODEX_PLUGIN="$(printf '%s\n' "$HOME"/.claude/plugins/cache/openai-codex/codex/*/ | sort -V | tail -1)"
node "${CODEX_PLUGIN%/}/scripts/codex-companion.mjs" setup --json   # wait for ready:true and auth.loggedIn:true
```

Not `ready` — **retry once**; unavailability is established by two attempts, and the command output goes into
the issue. Only then: one line to the user ("`/codex:setup` is needed") and run the pipeline single-headed,
marking in the issue every fork that went through without a second opinion. One failed attempt does not count
as a dead channel: that is the cheapest way out of the protocol, and therefore the first one you will reach for
under pressure.

The brief is written to `<session-scratchpad>/sol/<slug>.md` **before** the call, in five blocks: the context of
the task · facts with coordinates (`file:line`, URLs, numbers, quotes) · the options **with no marker of your
favourite** · the question in one line · the answer format. The last line of the file is mandatory and
verbatim: "the set of options may be framed wrong — reframe it if you see a better one". Your favourite, an
"I lean towards", options ordered by preference — all of that is the very anchor this channel exists to remove.

The judgement call itself runs **without `--write`**, it is read-only:

```bash
node "${CODEX_PLUGIN%/}/scripts/codex-companion.mjs" task --wait --model gpt-5.6-sol --effort high \
  "You are an independent expert. Read the brief: <ABSOLUTE path to sol/<slug>.md>. Give YOUR OWN decision: verdict, reasoning, what breaks if the alternative is chosen. Do not modify files, do not write code. If data is missing, name exactly what is missing and do not invent it."
```

`--effort xhigh` — only for a genuinely heavy architectural fork. Sol's answer is stored in full next to the
brief: `<session-scratchpad>/sol/<slug>.answer.md`.

**Sol is neither a boss nor an arbiter.** It does not see the session context, the conversations with the user
or the project's history. Its verdict against facts only Opus holds is overruled — with a line of reasoning to
the user. A second opinion is a judgement about the intent; a verifier checks the result. Neither replaces the
other.

## Codex — a hand (coding and code review)

Dispatched through the Agent tool: `subagent_type: "codex:codex-rescue"`, `model: sonnet` (the forwarder is
thin, the brains are Codex). The task text = routing flags + the dispatch envelope.

- `--wait --write --model gpt-5.6-sol` — always explicit, never rely on the default in `~/.codex/config.toml`.
  **Without `--write` the sandbox is read-only: the agent will report success and there will be no file on
  disk.**
- Do not set `--effort` (runtime default); raise it only when the user asks.
- Rework — a new call with `--resume` in the text (same thread); a fresh executor — `--fresh`; a worktree —
  `--cwd <path>`.
- **Review after every task that touched code** (`adversarial-review --base <SHA at the start of the task>`) —
  the cheapest way to convert idle Codex quota into quality; skip it only for one-line text edits.

Field constraints:

- **Empty prompt on spawn.** `codex:codex-rescue` sometimes receives only the service context and answers "no
  task attached". Do not respawn — resend the text to the same agent via `SendMessage`; it arrives the second
  time.
- **The sandbox has no network.** `gh` fails inside an executor. The spec arrives as files inside the
  workspace: `.tmp-issueN/spec.md` plus copies of the sources; the folder is kept out of the commit and deleted
  at acceptance.
- **ACL DENY on `.git`.** An executor cannot create `.git/index.lock`, so committing from Codex is impossible:
  the edits stay on disk and the Sonnet hand makes the conventional commit after the verifier's verdict. There
  is no `rg` in there either — self-checks go through the platform's own text search.
- **`--cwd` into a worktree is not battle-tested** — on the first parallel run, confirm the diff landed in the
  worktree; until then dispatch sequentially.

## Grok — scouting and second driver

`grok.exe` (SuperGrok subscription), called through Bash by the Sonnet hand. Call it by full path — it is not
always on PATH. Precondition, from the root of the target repo:

```bash
"$HOME/.grok/bin/grok.exe" -p "2+2" --output-format json   # exit 0 and {"text":"4",...}
```

No answer — the channel stops, one line to the user: `grok login` is needed.

Dispatch: `grok.exe -p "<envelope + ABSOLUTE paths>" --output-format json` → parse `{text, sessionId}`; rework
— `-r <sessionId>`. There is one model (`grok-4.5`), so `-m` can be omitted.

- **Write tasks require `--always-approve`** — without it the run ends in `stopReason:Cancelled` (the spec is
  read, the edits are NOT applied, and resuming does not help). The risk is contained by exact paths in the
  envelope and a `git diff --stat` post-check by the forwarding hand.
- **A prompt with leading dashes or `---` breaks the `-p` parser** — pass it via `--prompt-file <file>`.
- **Grok hangs on global file search.** Always exact paths; never give Grok a "find the file" task. Free-form
  web search is the opposite — that is its strength.
- Coding default is `--best-of-n 3 --check`; if you hit an RPM limit, drop to 1 and merge tasks into bigger
  ones.

## The Sonnet hand

Verification, `gh` operations (journal, labels, closing), commits on behalf of Codex. Clean context, narrow
prompt: a verifier is given the check from the DoD and a ban on reviewing the work. Any agent prompt with a
browser check must carry the headless requirement — the user is working in their own browser and stealing focus
is not acceptable.

## An external terminal orchestrator — optional

If you need a visible stream of worker output, or a non-Claude/non-Codex agent running in a terminal, route
through whatever terminal orchestrator the host provides. The pipeline rules do not change: the spec lives in
the issue, the envelope is a pointer to it, paths are absolute, "worker done" is not acceptance, and the user's
own terminals are never reused (workers get new ones).
