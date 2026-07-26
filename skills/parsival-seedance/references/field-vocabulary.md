# Field Vocabulary & Ready Snippets

Lookup values for the skeleton fields. The rules live in SKILL.md; this file is the value menu.

---

## Camera

### The One-Primary Rule
One primary movement per `camera:` field. Optionally one secondary using "then." Never three+.

**DO:**
```
camera: "Slow push-in, low angle."
camera: "Handheld tracking shot, then gentle rise."
camera: "Static wide shot. Hold."
```

**DON'T:** `"Handheld over-the-shoulder tracking shot from behind and slightly below, pushing through the crowd with anamorphic streak flares and focus hunting."` — four competing instructions; the model jitters.

### Rhythm over specs

| Use (rhythm) | Not (specs) |
|---|---|
| slow, smooth, gentle, gradual | 24fps, f/2.8, ISO 800 |
| controlled, stable, steady | focal length 85mm |
| dynamic, swift (sparingly) | shutter speed 1/50 |
| imperceptible, barely moving | rack focus at 0.3m |

### Supported camera types

| Type | Best for |
|---|---|
| Push-in / dolly in | Close-up emphasis, emotional focus |
| Pull-out / dolly out | Environmental reveal, context |
| Pan / lateral | Tracking, scanning |
| Tracking / follow | Action, walking |
| Orbit / arc | Product showcase, portraits |
| Aerial / drone | Landscapes, scale |
| Handheld | Documentary, realism |
| Fixed / locked-off | Focus on subject action |
| Tilt | Reveals, scale emphasis |
| Crane | Dramatic transitions |

### Position / angle vocabulary
Set the starting position before describing movement:
Extreme macro close-up · Low tabletop angle · Over-the-shoulder · High-angle master shot · Dutch angle (tilted frame) · First-person POV · Low angle looking up · Medium two-shot · Wide establishing shot · Overhead top-down · 90-degree side profile at ground level · Extreme low-angle worm's-eye · Inverted orientation (upside-down) · Lateral side-view two-shot

### Lens effects — go in `visual_feel:` or `vfx:`, NOT `camera:`
Focus rack between subjects · Shallow DOF with soft bokeh · Anamorphic streak flares · Film grain · Motion blur · Lens distortion on edges

---

## Action Writing

Every verb describes a visible, frame-by-frame movement.

**DO:**
- "Her eyes well up with tears. She pouts her lips excessively. She quickly grabs all three daifukus, hugging them to her chest."
- "He pinches a single red wire protruding from a port near her jawline. He pulls it. Slowly. Six inches of red cable slides out with a faint mechanical click-click-click."

**DON'T:**
- "She gets upset and grabs the food."
- "He activates her mechanism."

### Dangerous action words

| Avoid | Why | Use instead |
|---|---|---|
| "epic" | Model doesn't know what it means | Describe the specific visual effect |
| "amazing" / "beautiful" | Adjectives without guidance | Specific lighting, composition, texture |
| "lots of movement" | Jitter from over-motion | One specific, described motion |
| "fast" (unqualified) | Chaos without direction | "swift single step" or keep action slow |
| "cool" / "dynamic" | Vague aesthetic | Name the exact aesthetic reference |

---

## Lighting

Lighting is the highest-leverage single element. One line does more than ten adjectives. Every shot block gets a `lighting:` field.

**Per-shot examples:**
```
lighting: "Warm golden-hour backlight through window."
lighting: "Single red overhead wash, everything else dark."
lighting: "Soft overcast diffused light, even and flat."
lighting: "Neon blue rim light against deep shadow."
lighting: "Strobe pulses, white and violet, through haze."
```

**High-impact keywords:** golden hour · rim light · natural light · neon · backlit · overcast · volumetric (light rays through fog/haze/dust) · practical light (source visible in frame).

**Rule:** one lighting motivation per shot. Don't mix "harsh midday sun" and "soft overcast" — the model averages to gray mush.

---

## Stability Constraints (`avoid:`)

Every prompt includes an `avoid:` field in `production_notes`.

**Baseline (every prompt):**
```
avoid: "Jitter, bent or distorted limbs."
```

**Add by scene type:**

| Condition | Add |
|---|---|
| Clips over 10s | "temporal flicker" |
| Character-driven scenes | "identity drift" |
| Complex scenes (crowd, particles) | "chaotic composition" |
| Multi-shot, same character | "inconsistent features between shots" |
| Slow / contemplative | "unnecessary camera movement" |
| Reference images used | "character frozen in reference-image pose" |

**Words that degrade quality anywhere:** unqualified "fast," "cinematic" alone (always pair with a specific reference), "epic," "amazing"/"beautiful"/"stunning," stacked unqualified speed words.

---

## Common Critical Constraints (`critical_constraint:`)

Ready snippets — include the relevant one when applicable:

- **Surface animation:** "All animation stays flat and embedded on the physical surface — painted-on aesthetic, never 3D pop-out."
- **Handheld realism:** "Camera maintains handheld micro-shake throughout. Never stabilizes to tripod smoothness."
- **Stop-motion cadence:** "Stop-motion with intentional frame-to-frame jitter. No smooth interpolation. Characters move in holds and pops."
- **Material integrity:** "Physical objects maintain real-world reflections, weight, and surface properties even when stylized animation occurs on or within them."
- **No breaking the plane:** "Animated elements within a contained surface (teeth, screen, painting) never extend beyond the physical boundary of that surface."
- **Spatial layout lock (multi-character):** "[Character A] on the LEFT, [Character B] on the RIGHT, facing each other across the [aisle/space] throughout. Neither crosses behind the other at any point."
- **Reference pose exclusion:** "Reference images are STRICTLY character design anchors. [Character] NEVER shown in the frontal display pose from @image1."
