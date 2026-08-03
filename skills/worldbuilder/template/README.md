# World Bible v1 -- template for serialized short-form

A draft template for a world bible for serialized short-form video content (Reels/TikTok/Shorts with recurring creatures/locations/objects). Not a novel, not an encyclopedia: a minimally sufficient "operating system" for a world that generates stories, instead of one that consumes all your time before the first release.

## Why this, not "one big wiki"

A professional world bible is not one document but a bundle of several: a pitch bible (to sell), a world/lore bible (rules of reality), a production style bible (visuals), a continuity database (facts across the timeline). For a solo project one workspace is enough, but the roles inside it are kept separate -- otherwise you end up with either a pretty pitch and no fact database, or a thousand pages of lore with no production use.

## World-creation workflow (fill-in order)

1. **`00-creative-constitution.md`** -- the world's meaning core. Filled in via the `meaning` skill (meaning before form) BEFORE the other files -- otherwise the structure gets filled in but the world isn't about anything.
2. **`01-world-overview.md`** -- macro rules that lock early (see the table below).
3. **`02-records/`** -- canon record cards: creatures, locations, objects. Filled in as they appear in episodes, not stocked up in advance.
4. **`03-episode-architecture.md`** -- the episode format as a repeatable document, plus conflict generators from material that already exists.
5. **`04-continuity-log.md`** -- opens with the first episode, kept append-only.

Stopping rule (antidote to worldbuilder's disease, see `00-creative-constitution.md`):

> Don't build a world element unless it affects the current story, creates a reusable production asset, constrains future stories, or plants an intentional mystery.

## Iceberg principle: show / know / hint

Three canon layers for every world detail:

| Layer | Meaning | Example |
|---|---|---|
| **Show** | On-screen fact -- needed to follow the episode right now | Guards scan citizens' shadows |
| **Know** | Inferred system -- recurring clues the viewer can infer a system from | A shadow is legally equivalent to an identity |
| **Hint** | Private foundation -- the author knows, the viewer may never find out | The law appeared after a duplication crisis N years ago |

Every visible detail should imply at least one larger relationship (uniform -> power -> jurisdiction -> exceptions -> conflict), but the whole chain doesn't have to be revealed -- it just has to not be violated later.

This is an adaptation of Hemingway's "theory of omission": not every unsaid thing creates depth -- only the kind that governs the author's decisions and leaves consistent clues.

## Lock-early vs let-evolve

What locks at the start (architect) vs. what can grow along the way (gardener) -- a hybrid, not a pure architect or pure gardener:

| Lock early (hard at the start) | Let evolve (grows freely) |
|---|---|
| Central premise and emotional promise | Secondary characters/creatures |
| Rules of reality, technology, or magic | Unexplored locations |
| Silhouettes and identifiers of main characters/creatures | Folklore and rumors |
| Faction motives and major taboos | Side conflicts |
| Timeline anchors and irreversible events | Details suggested by the audience |
| Visual grammar and forbidden aesthetics | New formats and points of view |
| Canonical authority and revision procedure | Mysteries not yet answered |

Complements the **Garden Architect** model: hard macro rules (world physics, the central thematic conflict, the visual style guide) plus unwritten micro details until a specific scene needs to be generated -- so local episodes evolve organically without breaking global canon.

## Folder structure

```
template/
├── README.md                      -- this file
├── 00-creative-constitution.md    -- meaning core, tone, promise, anti-patterns
├── 01-world-overview.md           -- macro rules of the world
├── 02-records/
│   ├── creature.md                -- creature record card
│   ├── location.md                -- location record card
│   └── object.md                  -- object/symbol record card
├── 03-episode-architecture.md     -- episode as a document, story generators
├── 04-continuity-log.md           -- canon log (append-only)
└── checklist-creature-series.md   -- 15-point seriality checklist
```

How to create a new world: copy this skill's `template/` directory into `worlds/<world-slug>/` in your working repo, and fill it in following the workflow order above.
