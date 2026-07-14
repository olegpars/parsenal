export const meta = {
  name: 'kopatel-scout',
  description: 'Scout/Council phase: N taxonomy-architects (Opus) decompose an arbitrary topic into subtopics + cross-cutting themes, then a synthesizer writes taxonomy.json + extraction-spec.md and seeds frontier-w1.json',
  phases: [
    { title: 'Council', detail: 'N architects independently propose a decomposition + where authoritative info lives + seed queries', model: 'opus' },
    { title: 'Synthesize', detail: 'one agent merges proposals -> writes taxonomy.json, extraction-spec.md, frontier-w1.json', model: 'opus' },
  ],
}

// Baked at dig-init (see init-dig.mjs). Workflow args are unreliable, so the path lives in the file.
const DIG = '__DIG_PATH__'
const TOPIC = '__TOPIC__'
const META = DIG + '/_meta'

// How many independent architects to run. More = more diverse decompositions, more cost.
const N_ARCHITECTS = (args && args.architects) || 3
const seed_taxonomy = (args && args.seed_taxonomy) ? String(args.seed_taxonomy) : ''
const seed_taxonomy_block = seed_taxonomy
  ? 'A seed taxonomy is provided below. Use it as the base: add new branches and subtopics, refine wording, but do NOT delete or merge away existing subtopics.\n' +
    '<seed>\n' + seed_taxonomy + '\n</seed>\n\n'
  : ''

const TOOL_BOOT = ' --- TOOLING: if WebSearch / WebFetch / Read / Write are not available, FIRST call ToolSearch with query "select:WebSearch,WebFetch,Read,Write,Glob" to load them.'

const SOURCE_TYPES = ['primary_official', 'reference_docs', 'expert_analysis', 'community_discussion', 'community_media', 'aggregator_list', 'academic', 'cross_cutting']

const SUBTOPIC = {
  type: 'object',
  required: ['slug', 'title', 'group'],
  properties: {
    slug: { type: 'string', description: 'kebab-case unique id' },
    title: { type: 'string' },
    group: { type: 'string', description: 'id of the group this subtopic belongs to' },
    rationale: { type: 'string' },
  },
}
const CROSSCUT = {
  type: 'object',
  required: ['slug', 'title', 'grep'],
  properties: {
    slug: { type: 'string' },
    title: { type: 'string' },
    grep: { type: 'string', description: 'pipe-separated keywords to find relevant entries' },
  },
}
const SEED = {
  type: 'object',
  required: ['subtopic_slug', 'source_type', 'query_or_url', 'why', 'priority'],
  properties: {
    subtopic_slug: { type: 'string' },
    source_type: { type: 'string', enum: SOURCE_TYPES },
    query_or_url: { type: 'string' },
    why: { type: 'string' },
    priority: { type: 'integer', description: '1 = highest (authoritative first)' },
  },
}
const ARCH_SCHEMA = {
  type: 'object',
  required: ['groups', 'subtopics', 'crosscutting', 'seed_frontier', 'extraction_notes'],
  properties: {
    groups: { type: 'array', items: { type: 'object', required: ['id', 'label'], properties: { id: { type: 'string' }, label: { type: 'string' } } } },
    subtopics: { type: 'array', items: SUBTOPIC },
    crosscutting: { type: 'array', items: CROSSCUT },
    seed_frontier: { type: 'array', items: SEED },
    extraction_notes: { type: 'string', description: 'what counts as a valuable, durable claim for THIS topic' },
  },
}

phase('Council')
const architects = await parallel(
  Array.from({ length: N_ARCHITECTS }, (_, i) => () =>
    agent(
      'You are a TAXONOMY ARCHITECT scoping a deep-research knowledge base. Topic to dig:\n\n  "' + TOPIC + '"\n\n' +
      seed_taxonomy_block +
      'Your job is to carve this topic into a clean, MECE-as-possible structure that other agents will fill with researched evidence. You are architect #' + (i + 1) + ' of ' + N_ARCHITECTS + ' working INDEPENDENTLY — bring your own angle; do not converge to the obvious.\n\n' +
      'Do a little reconnaissance first (1-4 web searches) to learn the real landscape and the names people actually use — do NOT invent structure from priors alone.\n\n' +
      'Return:\n' +
      '1. groups: 2-5 top-level buckets the subtopics fall into (e.g. for "AI image+video models": {image, video, cross-cutting}; for "sourdough baking": {ingredients, technique, troubleshooting}). Each {id (kebab), label}.\n' +
      '2. subtopics: 6-24 concrete subtopics — the unit a single consolidated digest will cover. Each has a kebab slug, a human title, and the group id it belongs to. Prefer the natural "atoms" of the field (specific tools/models/methods/sub-domains), not vague headers.\n' +
      '3. crosscutting: 3-8 themes that cut ACROSS subtopics and are better learned once than repeated per-subtopic. Each {slug, title, grep} where grep = pipe-separated keywords to later find relevant entries.\n' +
      '4. seed_frontier: 8-20 CONCRETE first research targets. Prefer the MOST AUTHORITATIVE sources first (priority 1 = primary/official docs, standards, the canonical source; then expert analysis; then community). Each {subtopic_slug, source_type, query_or_url (a real URL if you know one, else a precise search query), why, priority}.\n' +
      '5. extraction_notes: 3-6 sentences on what a VALUABLE, DURABLE claim looks like for THIS specific topic — what to capture, what to ignore as noise/marketing/ephemera.\n' +
      'Slugs must be unique and stable. Every subtopic must reference an existing group id.' +
      TOOL_BOOT,
      { label: 'architect-' + (i + 1), phase: 'Council', schema: ARCH_SCHEMA, model: 'opus' }
    ).catch(() => null)
  )
)

const proposals = architects.filter(Boolean)
if (!proposals.length) {
  return { ok: false, note: 'all architects failed — rerun scout' }
}
log(proposals.length + '/' + N_ARCHITECTS + ' architects returned a decomposition')

// ---- Synthesize: merge proposals into the canonical taxonomy + extraction spec + seed frontier ----
// Schema-free, because the synthesizer WRITES files (Workflow scripts have no fs; the agent must).
// The artifacts are small, so a write is cheap and reliable here.
phase('Synthesize')

const proposalBlob = proposals.map((p, i) =>
  '### Architect ' + (i + 1) + '\n```json\n' + JSON.stringify(p, null, 1) + '\n```'
).join('\n\n')

const synthPrompt =
  'You are the LEAD EDITOR merging ' + proposals.length + ' independent taxonomy proposals into ONE canonical structure for a deep-research knowledge base on:\n\n  "' + TOPIC + '"\n\n' +
  seed_taxonomy_block +
  'Here are the proposals:\n\n' + proposalBlob + '\n\n' +
  'Merge them with judgement: union the good subtopics, dedupe near-duplicates (keep the clearest slug), drop the vague/overlapping, keep it 8-24 subtopics and 3-8 cross-cutting themes total. Pick the cleanest group set. Slugs unique & kebab-case.\n\n' +
  'Then WRITE EXACTLY THREE FILES:\n\n' +
  '=== FILE 1: ' + META + '/taxonomy.json ===\n' +
  'Valid JSON, this exact shape:\n' +
  '{\n' +
  '  "topic": "' + TOPIC + '",\n' +
  '  "slug": "__SLUG__",\n' +
  '  "groups": [ {"id":"<kebab>", "label":"<Human>"} , ... ],\n' +
  '  "subtopics": [ {"slug":"<kebab>", "title":"<Human>", "group":"<group-id>", "globs":["*<kw>*"]} , ... ],\n' +
  '  "crosscutting": [ {"slug":"<kebab>", "title":"<Human>", "grep":"<kw1|kw2|kw3>"} , ... ],\n' +
  '  "site": {\n' +
  '    "eyebrow":"<2-3 word kicker>", "brand":"<short site name>", "brand_sub":"<one-line subtitle>",\n' +
  '    "title":"<full site H1>", "tagline":"<one sentence what this is>", "foot":"<footer credit>"\n' +
  '  }\n' +
  '}\n' +
  'For each subtopic, "globs" = 1-3 filename globs that will match its entries (entries are named "<id>.<subtopic-slug>.<short>.md", so ALWAYS include "*.<that-slug>.*"; add extra keyword globs only if helpful).\n\n' +
  '=== FILE 2: ' + META + '/extraction-spec.md ===\n' +
  'A TIGHT spec (<= 40 lines) the per-source research agents will read. It says: what a valuable/durable claim looks like for this topic, what to capture (sections to fill), and what to ignore (marketing, ephemera). End with the entry section template the researchers should follow (TL;DR, Key findings tier-tagged, Details/specifics, Caveats & failure modes, Notes/dates) — adapt the section names to the topic if that helps.\n\n' +
  '=== FILE 3: ' + META + '/frontier-w1.json ===\n' +
  'Valid JSON: {"wave":1, "pending":[ ... ]} where pending = the merged, deduped union of all architects\' seed_frontier items, sorted by priority ascending (1 first). Each item EXACTLY: {"subtopic_slug","source_type","query_or_url","why","priority"}. Aim for 20-60 well-chosen first targets, authoritative-first. Drop duplicate query_or_url.\n\n' +
  'After all three files are written, reply with ONE line: DONE scout (S subtopics, C cross-cutting, F frontier items). Write valid JSON — it is parsed by Node downstream. Do not call any tool after the last Write.' +
  TOOL_BOOT

const synthMsg = await agent(synthPrompt, { label: 'synthesize-taxonomy', phase: 'Synthesize', model: 'opus' })

return {
  ok: true,
  architects: proposals.length,
  synth: String(synthMsg).slice(0, 200),
  wrote: [META + '/taxonomy.json', META + '/extraction-spec.md', META + '/frontier-w1.json'],
  note: 'verify the 3 files parse, then start the wave loop',
}
