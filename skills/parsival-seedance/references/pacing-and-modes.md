# Pacing, Modes & Multi-Clip Discipline

---

## Timestamp Scaling & Pacing

### Duration-to-shot scaling

| Duration | Recommended shots | Avg seconds/shot |
|---|---|---|
| 5s | 2–3 | 1.5–2.5s |
| 10s | 3–4 | 2.5–3.5s |
| 15s | 4–7 | 2–4s (staggered) |
| 20s | 5–7 | 2.5–4s |
| 30s | 7–10 | 3–4.5s |

### Stagger timecodes — do NOT default to even intervals

Even-interval pacing flattens scenes and removes kinetic shape. Use judgment per beat:
- **Short beats (1–2s):** impacts, eye-locks, slow-mo flashes, hard cuts, realization moments, cleaver clashes.
- **Medium beats (2.5–3.5s):** standard action, dialogue, reactions.
- **Longer beats (4–5s):** sustained action, ritual casts, transformation sequences, magic, dance.

**Good 15-second staggered patterns:**
- 0–2 / 2–4 / 4–7 / 7–8 / 8–11 / 11–13 / 13–15 (seven-shot variable rhythm)
- 0–3 / 3–6 / 6–7 / 7–10 / 10–13 / 13–15 (six-shot with a one-second impact flash)
- 0–2 / 2–5 / 5–6 / 6–9 / 9–12 / 12–15 (six-shot with impact flash)

### Pacing principles
- Opening shots can run longer (establishing context).
- Transformation / impact moments compressed (1–2s) for energy.
- Final shots benefit from a held beat — let the image breathe before the clip ends.
- Dialogue-driven scenes use longer shots; action scenes use shorter cuts.
- Slow-motion beats stay brief (≈1s) unless the slow-motion IS the scene — extended slow-mo deflates clip energy.

> A 20–30s YAML is a valid director plan, but won't fit one generation — split into clips ≤15s using the Multi-Clip Discipline below.

---

## Image-to-Video vs. Text-to-Video

When generating from a reference image, the prompt structure shifts:

| Element | Text-to-Video | Image-to-Video |
|---|---|---|
| Subject description | Must be detailed | Already in the image — can be shortened |
| Motion description | Full choreography | Focus on dynamic changes and movement |
| Composition | Describe fully | Add "preserve composition and colors" |
| Camera movement | Flexible | Must align with the image's existing composition |

For image-to-video, front-load with "Animate the provided image" or "Starting from the reference composition" and focus the prompt on what *changes* — not what the image already shows.

---

## Video Reference for Continuation

When a previous clip is the direct continuation reference (labeled `@video1`), open with a `prompt_start:` field BEFORE `title:`:

```yaml
prompt_start: "Continue from @video1."
title: "[Scene Title]"
reference_handling: "[...]"
```

(An in-prompt phrasing like `extend @video1` works too — it's plain text the model reads.) This continuation cue helps preserve character state, environment, and spatial positioning. Still re-describe everything fully within the character blocks — the model has no memory across generations, so `prompt_start` aids continuity but does not replace full re-establishment.

> **Dreamina reference mode matters.** The `@video1` / `prompt_start` notation above applies only in **Omni reference** mode — the video/image is attached as an `@<asset_name>` chip, and the chip name = the asset's panel name (usually the filename), so `@video1` resolves only if the asset is actually named that. In **First and last frames** mode the start (and optional end) frame are uploaded as image slots and you write NO `@` at all — omit `prompt_start` and any `@video1` from the text, or the dangling tag derails generation. Same no-`@` rule for **Multiframes**. Via API the ref is positional and `@video1` is fine. If you don't know which mode the user runs, ask before writing.

---

## Multi-Clip Sequence Discipline

When writing a sequence of clips that tell a continuous story:

1. **Every clip fully re-establishes** character, environment, wardrobe, materials, and scene state as if it is the only prompt the model will ever see. No "same character from Part 1," no "continuation narrative," no "escalated stakes from before."
2. **Carry visible physical damage forward.** Wounds, missing body parts, broken features from previous rounds become part of this clip's character design (via `features:` or `state_in_this_scene:`). A damaged character is more unique than a clean one → less drift toward the reference image. Especially important past clip three — by clip five characters should look visibly battered if the story escalates.
3. **Lock spatial relationships across clips.** If two characters face each other across an aisle in clip 3, they face each other across that same aisle in clip 4. State the layout explicitly in `critical_constraint`.
4. **End each clip on a hook, not a resolution.** Pre-strike tension, mid-motion cuts, held frames on a reaction beat — stronger closers than resolved action. Resolution happens inside the next clip.
5. **Re-describe environmental transformations in full.** If clip 3 summoned a new environment, clip 4's character block describes that environment from scratch as the established setting — not "as summoned previously."
