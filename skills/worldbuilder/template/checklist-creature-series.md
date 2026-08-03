# Seriality checklist -- Consistent Fictional Universe for AI-generated creature series

Run this when launching a new world, and periodically (item 15) to re-check. Items correspond to the `template/` files.

1. **Write a one-page series bible** -- the engine (cataloguing concept), the narrator/naturalist voice, the canon-tier rule, a map of 3-5 regions. -> `00-creative-constitution.md` + `01-world-overview.md`
2. **Design a taxonomy/naming system** -- consistent Latin/Greek roots; its own phono-aesthetic naming pattern per region, so names sound authentic. -> `02-records/creature.md`
3. **Build a visual style bible** -- a fixed string of style tokens, palette, 9:16, film-stock/lens keywords, typography, journal-frame/narrator assets.
4. **Assemble reference sets** for every recurring element (creature, journal, map, recurring locations). -> `02-records/`
5. **Pick a consistency method per asset** -- LoRA (15-30 varied images) or reference images + fixed tokens for recurring elements; reference + tokens for one-offs; seed control where available. -> `02-records/creature.md` -> Production data
6. **Consistent stills first, then animate one shot at a time** -- first/last-frame and reference-to-video controls; budget a 3:1-5:1 shooting ratio, cull drift immediately.
7. **Lock a repeatable episode template (SCP-style)** -- ritual cold open -> Entry #/binomial/common name -> one documented fact -> one eerie visual/motion beat -> a question hook. -> `03-episode-architecture.md`
8. **Number every entry and keep a canon log** as the single source of truth for catching contradictions. -> `04-continuity-log.md`
9. **Make every episode self-sufficient but cross-referenced** -- a full micro-payoff for newcomers; callbacks and numbering for returning viewers.
10. **Apply the iceberg + non-obviousness rule** -- build more than you show; never over-explain; let ambiguity generate viewer theories. -> see README's Iceberg principle
11. **Apply Sanderson's Third Law** -- connect existing creatures first (habitat, food chains, a unifying anomaly), then invent new types. -> `03-episode-architecture.md` -> Generators
12. **Design seriality for retention** -- an Instagram Series/playlist, a pinned "Start here / Entry #1", a short runtime for maximum completion rate (the dominant ranking signal).
13. **Turn comments into a co-creation loop** -- end on questions, reply in character, occasionally canonize the best viewer theories; encourage a fan bestiary/wiki.
14. **Keep a creature encyclopedia** (a production tracker: binomial, region, status, first-appearance number, visual reference) -- doubles as a production tracker. -> `02-records/creature.md`
15. **Review and revise before scaling** -- watch episode-2 retention and lore in the comments; when one creature pulls disproportionate attention, spin off a mini-arc; if contradictions pile up, freeze new lore and fix the canon bible. -> `04-continuity-log.md`
