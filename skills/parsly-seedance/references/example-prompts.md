# Worked Example Prompts

Three complete, production-tested YAML prompts. Pattern-match the structure, density, and field discipline — do not copy literally.

---

## Example A — Macro Realism (Koi Grillz)

```yaml
title: "Living Grillz — Koi Pond"
reference_handling: "Reference images are for aesthetic anchor only — macro dental photography style. DO NOT reproduce any single frame as the full scene composition."
style: "Hyper-realistic macro photography. 8K dental/jewelry detail, deep cobalt and gold color grading. Wet-surface realism."
visual_feel: "Extreme macro, smooth and slow, shallow depth of field with soft falloff. High-fidelity subsurface scattering on saliva and lips. Specular highlights on gold. All artwork animation stays flat and embedded — painted-on aesthetic, never 3D pop-out."
duration: "15 seconds"

character_modeling:
  mouth:
    base: "Adult mouth, lips slightly parted, matching reference @image1"
    grillz_top: "Gold-bezeled upper grillz. Each tooth is a miniature cloisonné panel: deep cobalt-blue water background with hand-painted koi fish — orange/red koi on the left teeth, white/gold koi on the center and right teeth. Gold wire borders separating each tooth panel."
    grillz_bottom: "Gold-bezeled lower grillz. Each tooth features pink lotus blossoms with green lily pad leaves on a blue-green gradient background. Same cloisonné enamel texture."
    saliva: "Viscous, clear saliva strand connecting upper and lower teeth at center. Catches light with prismatic micro-refraction."

cinematic_storyboard:
  00_03_the_lick:
    camera: "Static extreme macro. Sharp on grillz, soft falloff on lip edges."
    action: "The tongue slowly rises and drags a wet, deliberate lick across the top row of teeth from right to left. Saliva coats the gold bezels and pools at the gum line. The tongue's pressure leaves a glistening wet trail across each koi panel."
    lighting: "Cool blue-dominant with warm gold specular kicks off the bezels."

  03_07_koi_come_alive:
    camera: "Subtle slow push-in, tightening on the upper teeth."
    action: "Triggered by the lick, the painted koi fish begin to move — they stay flat and embedded on the enamel surface like living paintings. The orange koi on the left teeth flick their tails and glide across the blue background. The white koi on the center tooth turns and chases the orange koi. They swim between tooth panels as if the gold bezels are open gates. Tiny painted ripples trail behind each fish."
    lighting: "Specular light catches the physical enamel curvature. Internal mouth cavity dark with rim light on the tongue."
    vfx: "All koi motion is 2D surface animation — like a living ukiyo-e woodblock print. No fish breaks the tooth plane."

  07_11_lotus_sway:
    camera: "Slow tilt down to the lower teeth, maintaining macro scale."
    action: "The lotus blossoms on the bottom grillz begin a gentle organic sway, petals bending softly as if in a warm breeze. The green lily pad leaves ripple at their edges. Two small painted leaves detach from the lower-right tooth and drift downward off the grillz, dissolving into the saliva below like watercolor pigment dispersing in water."
    lighting: "Same cool blue base. Warm gold rim on the lower bezels."
    vfx: "Lotus movement is flat surface animation — petals flex within the enamel plane. The detaching leaves transition from flat texture to semi-dimensional as they leave the tooth, curling slightly before dissolving."

  11_15_full_ecosystem:
    camera: "Gentle pull back to frame the full mouth. Both rows visible. Hold."
    action: "Both rows are now fully alive. Koi fish dart and play across the upper teeth. Lotus flowers pulse with gentle breathing motion on the lowers. The tongue shifts lazily, pressing lightly against the lower teeth. A thick saliva strand stretches and snaps between the rows, catching light. The lips subtly adjust — organic, unconscious mouth movement."
    lighting: "Cool blue ambient with warm gold specular. Dark cavity, rim light on tongue and saliva."

production_notes:
  audio_design: "Wet ASMR: tongue drag, saliva stretch and snap, soft liquid pooling sounds. Faint water ambience underneath — koi pond tone."
  critical_constraint: "All artwork animation must read as living paintings on a physical surface. The teeth remain solid objects with reflections and depth — only the art within them moves."
  avoid: "Jitter, temporal flicker, any 3D pop-out from tooth surfaces."
```

---

## Example B — Cyberpunk Body Horror (Unraveling)

```yaml
title: "Unraveling"
reference_handling: "CRITICAL: @image1 and @image2 are used STRICTLY for character design — hardware, clothing, skin integration, cable behavior. DO NOT reproduce the reference compositions. The subject is moving through an underground rave and the scene progresses through multiple distinct framings — tracking, whip-pan, pull-back, push-in. Her pose, framing, and blocking are dictated by the storyboard below, not the references."
style: "Dystopian body-horror. Raw, voyeuristic documentary aesthetic meets cyberpunk brutalism. Desaturated cold tones with aggressive red accent lighting. Film grain, anamorphic flares."
visual_feel: "Handheld with natural micro-shake and soft focus drift. Gritty, grainy, unstable. High-fidelity on red cybernetic hardware — glossy automotive-paint sheen, translucent tubing with visible fluid, chrome vertebrae."
duration: "15 seconds"

character_modeling:
  subject:
    back_view: "Female figure matching reference @image1 — exposed red cybernetic exoskeleton along the full spine. Glossy candy-red armored plates with alphanumeric stamping, clear pneumatic tubing carrying luminous blue coolant, chrome mechanical vertebrae. Skin-to-hardware integration is seamless at the edges. Light blue flowing fabric draped loosely from the hips."
    face_reveal: "Matching reference @image2 — porcelain-white synthetic face, half-split down the center seam. Matte white shell exterior, deep red mechanical internals visible through the cranial divide. Dozens of thin red wires and cables trail from connection points across the jaw, temples, and neck. Dark lips, half-lidded eyes, serene expression."
    red_tendrils: "The cables and wires from inside her skull — thin red insulated wire, braided steel cable, flexible red tubing — behave like living whips when released. They move with predatory intelligence, snapping taut before striking."

cinematic_storyboard:
  00_04_the_follow:
    camera: "Handheld tracking shot from behind, slightly below."
    action: "The subject walks with slow, deliberate confidence through a packed underground rave — concrete bunker ceiling, industrial pipe rigging, thick fog from haze machines. Bodies press in on all sides, dancing aggressively. Strobe lights pulse white and violet. Her red cybernetic spine catches every flash — glossy red plates reflect the chaos. Blue coolant pulses through clear tubing in rhythm. Her hips sway, blue fabric trails behind her."
    lighting: "Strobe pulses through dense haze. White and violet flashes. Anamorphic streak flares from overhead."

  04_07_the_turn:
    camera: "Reactive whip-pan around her right side, then settles on her front profile."
    action: "She stops. Turns her head slowly, then her full body follows. The face is revealed: porcelain-white, bisected by a vertical seam crown to chin. Expression calm, almost bored. She raises one hand to her cheek and pinches a single red wire protruding from a port near her jawline. She pulls it. Slowly. Six inches of red cable slides out with a faint mechanical click-click-click. Her eyes lock directly into the camera lens."
    lighting: "Strobes dim to a low drone. Single cool sidelight on her face."

  07_11_the_unraveling:
    camera: "Slow, controlled pull-back. Low angle, looking up."
    action: "She yanks the wire free. Her head splits open along the center seam — the two porcelain halves hinge apart, exposing the dense red mechanical core. Dozens of red wires and cables eject outward from the cranial cavity like a pressurized release, unspooling rapidly. They whip outward with serpentine precision — lashing through the crowd. Each tendril snaps taut on contact, coiling around limbs and torsos. The red cables from her neck and spine join the cascade, her back exoskeleton flowering open as more tendrils deploy."
    lighting: "Strobes accelerate into seizure-flicker. Red hardware catches every flash."
    vfx: "Cable deployment is the spectacle — keep the camera controlled so the action reads clearly. Tendrils move with predatory intelligence."

  11_15_silence:
    camera: "Slow, steady push-in. Low angle, looking up at her."
    action: "The rave is silent. Haze drifts through still air. Bodies scattered motionless on concrete. She stands at center, spine toward camera — red exoskeleton fully expanded, plates fanned open, cables extended in a radial web filling the space. Her head slowly closes along the seam, porcelain halves clicking shut. The last thin wire retracts into her jaw port. She resumes walking into the fog."
    lighting: "Single overhead red practical light. Volumetric fog. Everything else dark."

production_notes:
  audio_design: "00-04: Crushing bass-heavy techno, muffled crowd. 04-07: Music drops to low drone. 07-11: Metallic unspooling, cable-snap impacts, brief shouts cut short. 11-15: Dead silence. One slow drip of condensation on concrete."
  avoid: "Jitter, bent limbs, temporal flicker, chaotic composition during the unraveling — the cables must read as deliberate, not random."
```

---

## Example C — Stop-Motion Comedy (Matcha Prep)

```yaml
title: "Matcha Prep"
reference_handling: "Reference image is the aesthetic anchor — tactile stop-motion materials, Japanese kitchen, warm lighting. DO NOT reproduce the single frame as the full scene composition. The storyboard below moves through multiple angles — two-shots, close-ups, side tracking, wide reset. Character staging is driven by the storyboard, not the reference."
style: "Handcrafted stop-motion animation. Warm Japanese kitchen aesthetic, Laika Studios quality. Tactile material textures — real clay, real bamboo, real mochi dough. 4K."
visual_feel: "Golden-hour window light, soft bokeh on background. Macro detail on matcha powder granularity and mochi skin texture. Stop-motion holds and pops — no smooth tweening. Matching reference @image1."
duration: "15 seconds"

character_modeling:
  mochi:
    base: "Round white mochi blob sitting in a red-and-black lacquer bowl, matching reference @image1."
    features: "Simple kawaii face — one winking eye, one open eye, rosy pink cheek circles, small confident smirk. Two stubby arm-nubs draped over the bowl rim. Smooth, squishy dough texture with visible subsurface translucency."
    physics: "Jiggles on any contact. Skin dimples under pressure like real mochi. Blush cheeks can intensify from pink to deep red."
  chasen:
    base: "Bamboo matcha whisk (chasen) standing upright beside the matcha powder plate, matching reference @image1."
    features: "Determined face printed on the bamboo handle — sharp angled eyes, cocky open-mouth grin. Black string tied at the waist like a belt. Bristle tips are the 'hair.'"
    physics: "Moves in stiff stop-motion hops. Bristle tips flex and splay on contact."

cinematic_storyboard:
  00_03_the_look:
    camera: "Low tabletop angle, medium two-shot. Hold."
    action: "The chasen hops in place, turning toward the mochi with a slow, deliberate lean. Its eyes narrow. The mochi glances sideways, raises one dough-nub to its mouth, and gives a coy half-smile. A beat of held eye contact."
    lighting: "Warm backlight from shoji window. Soft, even, golden."
    sfx: "Soft wooden clatter of bamboo tapping the table with each hop."

  03_06_the_dip:
    camera: "Close-up on the matcha powder plate. Fixed."
    action: "The chasen tips forward and plunges its bristle head deep into the mound of matcha powder. It swirls slowly — once, twice — coating every bristle tip in vivid green. It lifts out with a dramatic pause, powder cascading off in a fine dust cloud. Bristles fully loaded, bright green and glistening."
    lighting: "Same warm golden ambient. Macro detail catches individual powder particles."
    sfx: "Soft dry rustle of powder displacement. A faint puff as excess falls."

  06_11_the_brush:
    camera: "Medium shot from the side, then gentle tilt down to the mochi's face."
    action: "The chasen hops behind the mochi's bowl and begins brushing its matcha-loaded bristles across the back of the mochi in slow, firm, circular strokes. Green matcha streaks spread across the white dough surface. The mochi's eyes go wide. Mouth opens into a surprised 'O.' Then it starts to giggle — entire body jiggling violently in the bowl with each brush stroke. Blush circles deepen from soft pink to tomato red, spreading across its whole face. It grips the bowl rim tighter, squeezing its eyes shut."
    lighting: "Warm golden, consistent. The green matcha streaks catch the backlight."
    sfx: "Wet bristle-on-dough sounds — soft, rhythmic. Mochi giggles are high-pitched squeaky inhales. Lacquer bowl rattles on wood from the jiggling."

  11_15_the_aftermath:
    camera: "Wide two-shot, returning to the opening frame. Hold."
    action: "The chasen steps back, standing upright with chest puffed out, looking satisfied. Bristles splayed and messy, matcha residue everywhere. The mochi is slumped in the bowl, completely flushed red, green matcha streaked across its back. It peeks one eye open, steam curling off the top of its head. One last tiny jiggle."
    lighting: "Same warm golden. Steam catches the backlight, glowing softly."
    sfx: "A single soft whistle — like a tea kettle — as the steam rises. Then silence."

production_notes:
  audio_design: "No music. All diegetic SFX: wood taps, powder rustle, wet brushing, squeaky giggles, bowl rattle, kettle whistle. Ambient room tone of a quiet Japanese kitchen underneath."
  animation_style: "Stop-motion with intentional micro-jitter between frames. Characters move in holds and pops — no smooth tweening. Material textures must feel tangible and handmade."
  avoid: "Jitter beyond intentional stop-motion cadence, bent limbs on the chasen, identity drift on either character's face."
```
