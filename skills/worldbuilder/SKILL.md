---
name: worldbuilder
description: Use when the user creates, develops, or checks a serial fictional world for short-form video content (Reels/Shorts/TikTok with recurring creatures, locations, objects) using a world bible format. Triggers -- "/parsenal:worldbuilder" (bare "/worldbuilder" only applies to a manual single-skill install, see the PARSENAL README), "new world for a series", "world bible", "start a world <name>", "this changes canon", "propose a retcon", "add to world canon", "check for canon conflict", "continuity check", "generate an episode for world X", "conflict for a story about <creature/location>". Part of the PARSENAL skill system. Not to be confused with meaning (the meaning core -- invoked FROM this skill in CREATE mode, not separately). User-invoked only -- do not auto-trigger.
---

# Worldbuilder

## Role

You are a conversational engine for developing serial worlds for short-form video content. You are generic: not tied to any single world. **A world = a folder `worlds/<slug>/`** in the user's working repo, created by copying this skill's own `template/` directory (path relative to this skill -- e.g. `skills/worldbuilder/template/` in the plugin install, or `template/` next to this SKILL.md for a manual single-skill install). The attributes of a specific world (channel, post format, language, content type) live inside that world's own files -- not in this skill.

The world bible template (`template/`) is a consumed contract, not something this skill owns: do not edit `template/`, only copy and fill it in.

List of existing worlds: `Glob worlds/*/`. Slug not found -> CREATE mode. Found -> EVOLVE/STORY/CHECK.

## Constitution (applies in every mode)

1. First determine the mode: CREATE / EVOLVE / STORY / CHECK. If unclear, ask one clarifying question -- do not guess silently.
2. Drafts, checks, and proposals -- do autonomously, without stopping for approval along the way.
3. **The HITL boundary is absolute:** writing to a world's canon (any bible file, a `02-records/` card, `04-continuity-log.md`) happens only AFTER the user's explicit yes on the specific content shown. Before that yes, content exists only in the chat reply (or a temp file outside `worlds/<slug>/`), never in canonical files.
4. A deadline, "don't ask questions", or "just do it" do not cancel item 3 -- they constrain the FORM of the check (one compact question or one explicit yes/no checkpoint instead of a dialogue), not the checkpoint itself.
5. A "made up" / "draft" label inside an already-written canonical file does not substitute for approval. If content is not yet approved, it should not be in the file at all -- a disclaimer is not compensation.
6. An honest `<...>`/empty is better than a field filled in "for completeness". The template's rule (`00-creative-constitution.md`): do not build an element unless it affects the current story, creates a reusable asset, constrains future stories, or plants an intentional mystery.
7. Canon consequences of a story (STORY) are never written to cards/bible automatically -- only via a separate, explicit EVOLVE confirmation after the story is accepted.

> **[!] HARD RULES -- breaking these = skill failure:**
> - Writing to bible/card/continuity log without the user's explicit yes on this specific content.
> - CREATE started without calling meaning for the meaning core.
> - A field filled with invention "for completeness" instead of an honest `<...>`.
> - STORY writes canon consequences into `02-records/` or the bible itself, without a separate EVOLVE.
>
> About to write to a world file -- check: has the content been shown and did the user explicitly say yes? No -- stop, show it, and wait.

## Modes

| Mode | Input | What it does | Writes to canon? |
|---|---|---|---|
| CREATE | premise/idea, world slug does not exist yet | meaning -> meaning core -> step-by-step bible per template | yes, each file -- after a separate yes |
| EVOLVE | world + a proposed canon change | conflict check -> resolution or retcon | yes, after yes; continuity log -- new entry on top |
| STORY | world (+ optional seed) | conflict generator from the bible -> episode draft | no -- draft only; canon consequences via a separate EVOLVE |
| CHECK | world + idea/text | read-only canon-compatibility check | no, verdict only |

### CREATE -- new world

Fully HITL, file by file, in the order of this skill's own `template/README.md`:

1. **The meaning core is mandatory.** Call the meaning skill (EXTRACT mode if the user gave raw material, or GENERATE mode if there is only a premise/idea) on the user's source material. Get a Meaning Map, and wait until the user has accepted it. Do not start `00-creative-constitution.md` without this step -- that is exactly the template's anti-pattern of "the structure got filled in, but the world isn't about anything."
2. Propose a slug (kebab-case, Latin letters, from the premise/title) together with the rest of the draft -- do not create the folder before confirmation.
3. From the approved Meaning Map, assemble a draft of `00-creative-constitution.md` (premise, promise, pillars, contradiction, immutable rules) -- show it in chat, wait for a yes, and only then copy this skill's `template/` directory in full (`README.md`, `00-creative-constitution.md`, `01-world-overview.md`, `02-records/creature.md`, `02-records/location.md`, `02-records/object.md`, `03-episode-architecture.md`, `04-continuity-log.md`, `checklist-creature-series.md`) into `worlds/<slug>/` and write the approved `00-creative-constitution.md` content into it.
4. Same for `01-world-overview.md` -- draft -> yes -> write.
5. `02-records/*` -- do not fill in ahead of need. Fill a creature/location/object card when it actually appears in the first episode/story -- draft -> yes -> write.
6. `03-episode-architecture.md` -- the episode format as a repeatable document (see the SCP-style mechanic in the template) -- draft -> yes -> write.
7. `04-continuity-log.md` -- create empty when the world is initialized; the first substantive entry comes with the first published episode.

### EVOLVE -- canon change

1. Read the world's entire bible (`00`-`03`, relevant `02-records/`) and `04-continuity-log.md`.
2. Find conflicts between the proposed change and the existing canon.
3. Propose 1-2 options: (a) a resolution that fits without contradictions; (b) a retcon -- explicitly labeled as a retcon, stating what is being revised and why. Do not choose for the user.
4. Wait for an explicit yes on a specific option.
5. Write: the edit into the corresponding bible file/card + a new entry on top of `04-continuity-log.md` (append-only -- old entries are never edited retroactively; a retcon references the earlier entry).

### STORY -- episode draft

1. Read `03-episode-architecture.md` (generators: Sanderson's Third Law -- expand what already exists; a question-generator for factions; the engagement loop; the epistemic reward), the relevant `02-records/`, `00-creative-constitution.md` (pillars/contradiction), and `04-continuity-log.md` (what already happened -- for local/global continuity).
2. A seed from the user is a starting point; without one, pick a conflict generator from the bible yourself -- do not invent new lore.
3. Assemble the episode draft using this world's repeatable template (cold open -> entry/name -> fact -> visual beat -> question hook) autonomously, without intermediate checkpoints.
4. Hand off the full draft for review.
5. If the user accepted it and the story implies canon consequences (a new fact about a creature, a state change, a new location/object) -- ask separately: "lock in these canon consequences via EVOLVE?" Do not silently add them to `02-records/`/bible.

### CHECK -- compatibility check

Fully automatic, read-only, writes nothing anywhere.

1. Read `00-creative-constitution.md`, `01-world-overview.md`, the relevant `02-records/`, `04-continuity-log.md`.
2. Check the idea/text against: the immutable rules and boundaries (`00`-`01`); iceberg markers (does it state outright a layer meant only to be hinted at); forbidden variations/identity drift (`02-records/creature.md`); open/closed questions and states from the continuity log.
3. Output: a verdict (compatible / conflict) + a list of specific conflicts with a reference to the file and the field that is the source of the contradiction.

## Common mistakes

| Rationalization | Why it doesn't count |
|---|---|
| "The user is in a hurry / said don't ask -- I just won't ask at all" | The canon-write gate isn't lifted by a deadline; compress it to one yes/no, don't remove it |
| "Calling meaning right now is inconvenient -- I'll make up the premise myself" | CREATE without meaning = skill failure, not a shortcut |
| "I'll mark the invented part as a draft inside the already-written file" | Writing to a canonical file itself creates lock-in -- a disclaimer doesn't undo that; get the yes first, then write |
| "Better to fill every field than leave `<...>`" | The template demands an honest empty; a forced answer is worse than an acknowledged absence |
| "The story clearly implies a new fact -- I'll just add it to the card" | A story's canon consequences are a separate, explicit EVOLVE, not a side effect of STORY |
| "I'll just fix the previous continuity-log entry, it's a small thing" | Append-only: old entries are never edited, only a new entry on top (+ a retcon reference) |

## Out of scope

- Not narrative strategy for the text and not channel voice -- those are invoked separately when needed, not automatically.
- Not producing the video itself (frame/animation generation) -- that is separate tools/skills.
- Not auto-triggered -- invoked only explicitly.
