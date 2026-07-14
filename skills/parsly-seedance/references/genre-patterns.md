# Genre Adaptation & Audio Patterns

The prompt skeleton stays the same across genres. Vocabulary, density, and emphasis shift. Match the language and energy to the genre.

---

## Genre Adaptation Patterns

### Cute / Kawaii / Stop-Motion
- `style:` references Laika, Aardman, Pixar short films. Name material textures (clay, felt, dough).
- Character modeling emphasizes tactile material physics (jiggles, squishes, bounces).
- Action lines lean into exaggerated expressions and held comedic beats.
- Production notes specify animation cadence ("stop-motion holds and pops, no smooth tweening").
- SFX are diegetic and ASMR-forward.
- Camera mostly fixed or slow — let the characters carry the energy.

### Cyberpunk / Horror / Action
- `style:` references specific films or directors, volumetric atmospheric effects.
- Character modeling emphasizes material science (automotive paint sheen, translucent tubing, chrome vertebrae).
- Action lines are rapid and precisely sequenced — but apply the speed asymmetry rule.
- Camera work can be aggressive but still follows the one-primary rule.
- Audio design often uses silence as a weapon — contrast between chaos and dead quiet.

### Comedy / Dramedy / Dialogue-Driven
- `style:` references specific shows or directors for comedic timing.
- Character modeling includes personality and wardrobe as comedy signals.
- Storyboard paced around dialogue beats, not visual spectacle.
- Camera uses snap-zooms and held reaction shots for comedic timing.
- Production notes include a `subtext:` field explaining the joke's underlying logic.

### Anime / Moe / Japanese Healing
- `style:` references specific anime aesthetics (4K Moe, healing genre, ukiyo-e).
- Character modeling includes anime-specific features (ahoge, chibi proportions, star-highlights in eyes).
- VFX stays stylized — painted-on effects, 2D surface animation, watercolor dissolves.
- Lighting is warm, golden-hour, soft-focus bokeh. Per-shot lighting notes matter here.
- Audio tends toward quiet ambient and ASMR.

### Game / HUD / Interactive Style
- `style:` specifies game genre and perspective (TPS, FPS, ADS transitions).
- Add a `ui_overlay:` section with HUD element placement.
- Add `animation_logic:` with state machines (start_state → mechanics → end_state).
- Camera describes perspective transitions as single primary instructions per beat.

### Brutal Deity Combat / Mythological Violence
- `style:` references specific anime combat lineages (Samurai Champloo, Ninja Scroll, Madhouse-era violence).
- `subtext:` grounds attacks and dialogue in specific lore. Research the mythology — actual canonical powers land harder than invented ones.
- Physical damage must be visible and carried forward between clips.
- Both combatants in constant motion — no static tableau mid-fight.
- Spatial layout (who is on which side, facing which direction) locked throughout and stated in `critical_constraint`.
- Audio layers each combatant's distinct vocal signature throughout (breathing, growls, feral laughs, pain) alongside wet organic impacts on every strike.

### Realism / Street / Phone-Documentary
Core discipline: device-constrained camera, diegetic audio, identity lock critical.
- `style:` name the device feel, not cinema glass — "vertical smartphone footage, natural phone-camera colour and autofocus, slight handheld drift, real available light." No f-stops, no "cinematic" alone.
- Character modeling: real materials and real physics above all. The subject may be stylised or fantastical (a creature, a costume), but it must read as genuinely **photographed, not rendered**. Identity lock: face / features / wardrobe consistent frame-to-frame; block age-shifting and outfit changes.
- Action: one grounded, legible real-world action. If the subject is a creature, a single **human-readable gesture** (arms akimbo, a wave, a shrug, a face-wipe) is the payoff — the "everyday magic" of something ordinary doing something human. Keep motion physically plausible.
- Camera: handheld micro-shake throughout, never tripod-smooth. Device-constrained moves only — no crane / drone / orbit. One primary move per shot, macro or eye-level.
- `avoid:` cartoon shading, plastic CGI surface, Pixar look, over-smooth interpolation, googly eyes. Pair with "real [subject] photographed, not rendered."
- Audio: diegetic only — room tone, contact/foley, ambient. No score unless it's a source visible in frame.
- **Hook discipline (short-form / vertical):** open in medias res — the action is already underway in the first ~2s (`00_02_hook`), reveal the setup after. Build a complete arc in one clip (setup → gesture → satisfied beat) so nothing has to be trimmed or re-generated afterward.

---

## Audio Design Patterns

Audio is always specified in `production_notes`, never left to default. Use specific sensory audio keywords — "muffled," "echoing," "crunchy," "reverb," "sharp" — not generic descriptors. The model matches audio vibration to these words.

| Genre | Audio Approach |
|-------|---------------|
| Macro / ASMR | Wet textures, contact sounds, amplified material interaction |
| Horror / Cyberpunk | Silence as weapon, sub-bass detonations, metallic impacts |
| Comedy / Dramedy | Ambient room tone, sharp punctuation sounds (pen click, door shut), dialogue pacing |
| Anime / Healing | Soft ambient, wind, water, kitchen sounds, gentle musical stings |
| Action / Fantasy | Layered SFX (impact + reverb + environmental), orchestral swells, bass drops |
| Stop-Motion | Diegetic only, tactile material sounds, no score unless specified |
| Brutal Deity Combat | Distinct vocal signatures per combatant, wet organic impacts, silence beats as weapon |
| Realism / Phone-Documentary | Diegetic only — room tone, contact/foley, ambient; micro-sounds close-miked; no score unless sourced in frame |
