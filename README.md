# Parsly

Skills for AI video creators, built for Claude Code and compatible agent runtimes. Battle-tested on real production work.

## Skills

| Skill | What it does |
|-------|--------------|
| [parsly-seedance](skills/parsly-seedance/) | Director-grade YAML prompter for ByteDance Seedance 2.0: timestamped multi-shot storyboards, character modeling blocks, reference-image anti-drift discipline, genre presets, platform-aware length budgeting. |

More Parsly skills are on the way.

## Install

Clone the repo and copy the skill into your Claude Code skills directory:

**macOS / Linux**

```bash
git clone https://github.com/olegpars/parsly
cp -r parsly/skills/parsly-seedance ~/.claude/skills/
```

**Windows (PowerShell)**

```powershell
git clone https://github.com/olegpars/parsly
Copy-Item -Recurse parsly/skills/parsly-seedance "$env:USERPROFILE\.claude\skills\"
```

Then just ask for what you need — e.g. "write me a timestamped Seedance storyboard prompt" — and the skill triggers automatically.

## Requirements

- Claude Code (or any runtime that supports SKILL.md-format agent skills)
- A Seedance 2.0 access point (Dreamina, Jimeng, CapCut, or API) to run the generated prompts
