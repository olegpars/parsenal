export const meta = {
  name: 'kopatel-wave-n',
  description: 'One research wave: self-locate the latest frontier, load the top-N batch, web-research each item (one agent per item) into an entry file, and surface new_frontier so the dig keeps deepening',
  phases: [
    { title: 'Load', detail: 'one agent finds the highest frontier-wN.json, returns the top-N batch + extraction spec + subtopic list' },
    { title: 'Research', detail: 'one Sonnet agent per item: web-research -> write entry -> propose new frontier' },
  ],
}

// Baked at dig-init. Workflow args are unreliable (can arrive JSON-stringified), so this wave is
// SELF-LOCATING: the loader globs the highest-numbered frontier-wN.json and reports its wave number.
const DIG = '__DIG_PATH__'
const TOPIC = '__TOPIC__'
const META = DIG + '/_meta'
const BATCH_SIZE = (args && args.batchSize) || 44

const TOOL_BOOT = ' --- TOOLING: If WebSearch / WebFetch / Write / Read / Glob are not already available, FIRST call ToolSearch with query "select:WebSearch,WebFetch,Write,Read,Glob" to load them.'

const SOURCE_TYPES = ['primary_official', 'reference_docs', 'expert_analysis', 'community_discussion', 'community_media', 'aggregator_list', 'academic', 'cross_cutting']
const FRONTIER_ITEM = {
  type: 'object',
  required: ['subtopic_slug', 'source_type', 'query_or_url', 'why', 'priority'],
  properties: {
    subtopic_slug: { type: 'string' },
    source_type: { type: 'string', enum: SOURCE_TYPES },
    query_or_url: { type: 'string' },
    why: { type: 'string' },
    priority: { type: 'integer' },
  },
}
const ENTRY_SCHEMA = {
  type: 'object',
  required: ['id', 'subtopic_slug', 'entry_path', 'claim_count', 'new_frontier', 'sources'],
  properties: {
    id: { type: 'string' },
    subtopic_slug: { type: 'string' },
    entry_path: { type: 'string' },
    claim_count: { type: 'integer' },
    summary: { type: 'string' },
    new_frontier: { type: 'array', items: FRONTIER_ITEM },
    sources: { type: 'array', items: { type: 'object', required: ['url', 'tier'], properties: { url: { type: 'string' }, title: { type: 'string' }, tier: { type: 'string', enum: ['A', 'B', 'C', 'D'] } } } },
  },
}

// ---- Load the batch (self-locating) + broadcast the extraction spec & subtopic list ----
phase('Load')
const LOAD_SCHEMA = {
  type: 'object',
  required: ['wave', 'items', 'subtopic_slugs', 'extraction_spec'],
  properties: {
    wave: { type: 'integer' },
    items: { type: 'array', items: FRONTIER_ITEM },
    subtopic_slugs: { type: 'array', items: { type: 'string' } },
    extraction_spec: { type: 'string' },
  },
}
const loaded = await agent(
  'Glob ' + META + ' for files matching frontier-w*.json . Among matches choose the file with the HIGHEST wave number N (the integer in frontier-wN.json). Read THAT file; it is JSON {"wave":N, "pending":[...]}.\n' +
  'Also Read ' + META + '/taxonomy.json (collect every subtopic slug from its "subtopics" array) and Read ' + META + '/extraction-spec.md (return its FULL text, trimmed).\n' +
  'Return {wave: N, items: the FIRST ' + BATCH_SIZE + ' elements of pending copied EXACTLY (fields subtopic_slug, source_type, query_or_url, why, priority — do not invent/reorder/modify), subtopic_slugs: [all subtopic slugs], extraction_spec: "<full text of extraction-spec.md>"}.' +
  TOOL_BOOT,
  { label: 'load-frontier', phase: 'Load', schema: LOAD_SCHEMA }
)
const wave = (loaded && Number.isInteger(loaded.wave)) ? loaded.wave : 0
const subtopicSlugs = (loaded && loaded.subtopic_slugs) || []
const spec = (loaded && loaded.extraction_spec) || '(no extraction spec found — extract durable, actionable, source-attributed facts on the topic)'
let batch = (loaded && loaded.items ? loaded.items : []).map((it, i) => ({ ...it, id: 'w' + wave + '-' + String(i + 1).padStart(3, '0') }))
log('loaded ' + batch.length + ' frontier items for wave ' + wave)
if (!batch.length) {
  return { wave, entries_written: [], entries_count: 0, total_claims: 0, per_subtopic: {}, researched_targets: [], new_frontier: [], sources_seen: [], note: 'empty batch — frontier dry or load failed' }
}

const SLUGLIST = subtopicSlugs.join(', ')

// ---- Research: one Sonnet agent per item ----
phase('Research')
const researched = await parallel(batch.map(item => () =>
  agent(
    'You are a research agent building a deep-knowledge base on the topic:\n\n  "' + TOPIC + '"\n\n' +
    'Execute exactly ONE research target and write ONE entry file.\n\n' +
    'TARGET:\n' +
    '- id: ' + item.id + '\n' +
    '- subtopic_slug: ' + item.subtopic_slug + '\n' +
    '- source_type: ' + item.source_type + '\n' +
    '- target: ' + item.query_or_url + '\n' +
    '- why it matters: ' + item.why + '\n\n' +
    'WHAT COUNTS AS A VALUABLE CLAIM (extraction spec for this topic):\n' + spec + '\n\n' +
    'KNOWN SUBTOPIC SLUGS (use these exact slugs when tagging this entry and any new_frontier): ' + SLUGLIST + '\n\n' +
    'STEP 0 (dedup guard): Glob ' + DIG + '/entries/ . If an existing entry clearly already covers this EXACT source URL or a near-identical sub-point, do NOT duplicate: return claim_count 0, summary "dup of <existing filename>", empty new_frontier and sources, and skip writing.\n' +
    '1. If target is a URL, WebFetch it. If it is a query, WebSearch it and WebFetch the best 1-3 results.\n' +
    '2. Extract ONLY durable, actionable knowledge per the extraction spec above. Ignore marketing fluff and ephemera.\n' +
    '3. Tag every claim with a credibility tier: [A] primary/official source or canonical reference, [B] expert analysis / strong independent testing / staff posts, [C] reputable community, [D] single-source folklore. Keep the source URL with each claim.\n' +
    '4. WRITE a markdown entry to: ' + DIG + '/entries/' + item.id + '.' + item.subtopic_slug + '.<short-kebab>.md  (short-kebab = 2-4 words on the specific point). Frontmatter + sections:\n\n' +
    '---\nid: ' + item.id + '\nsubtopic: ' + item.subtopic_slug + '\nsource_type: ' + item.source_type + '\ncredibility: <dominant tier>\nsources:\n  - <url> (tier X, <date if known>)\nwave: ' + wave + '\n---\n\n' +
    '# <Subtopic> — <short title>\n\n' +
    '## TL;DR\n- 3-6 bullets, most actionable first.\n\n' +
    '## Key findings\n(each line tagged [A]/[B]/[C]/[D] + source)\n\n' +
    '## Details / specifics\n\n' +
    '## Caveats & failure modes\n\n' +
    '## Notes / dates / version drift\n\n' +
    '(Adapt section names to the topic if the extraction spec suggested different ones.)\n\n' +
    '5. Return the structured object. new_frontier = things you SAW REFERENCED but did NOT cover (other authoritative sources, linked threads, specific sub-points) — 0-6 GENUINELY NEW items, each tagged with the best-matching subtopic_slug from the list above (or the closest one). NEVER re-list the target you just did. sources = every URL you actually used, each with a tier.\n\n' +
    'If you find nothing useful, write a short dead-end entry and return claim_count 0.' +
    TOOL_BOOT,
    { label: 'research:' + item.subtopic_slug + ':' + item.id, phase: 'Research', schema: ENTRY_SCHEMA, model: 'sonnet' }
  )
))

const ok = researched.filter(Boolean)
const idToTarget = {}
for (const it of batch) idToTarget[it.id] = { subtopic_slug: it.subtopic_slug, target: it.query_or_url }
const researchedTargets = ok.map(r => idToTarget[r.id]).filter(Boolean)
const newFrontier = ok.flatMap(r => Array.isArray(r.new_frontier) ? r.new_frontier : [])
const sources = ok.flatMap(r => Array.isArray(r.sources) ? r.sources : [])
const perSubtopic = {}
for (const r of ok) { perSubtopic[r.subtopic_slug] = (perSubtopic[r.subtopic_slug] || 0) + 1 }

return {
  wave,
  entries_written: ok.map(r => ({ id: r.id, subtopic_slug: r.subtopic_slug, path: r.entry_path, claims: r.claim_count, summary: r.summary })),
  entries_count: ok.length,
  total_claims: ok.reduce((s, r) => s + (r.claim_count || 0), 0),
  per_subtopic: perSubtopic,
  researched_targets: researchedTargets,
  new_frontier: newFrontier,
  sources_seen: sources,
}
