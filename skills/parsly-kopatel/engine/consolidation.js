export const meta = {
  name: 'kopatel-consolidate',
  description: 'Fan out one agent per subtopic + per cross-cutting theme to merge raw entries/ into clean deduplicated digests, then one agent writes the OVERVIEW with a comparison matrix. Schema-free (agents write files), idempotent, batched.',
  phases: [
    { title: 'Load', detail: 'one agent reads taxonomy.json -> returns the subtopic + cross-cutting lists' },
    { title: 'Consolidate', detail: 'one agent per subtopic & per cross-cutting reads its entries and writes a clean digest', model: 'opus' },
    { title: 'Overview', detail: 'one agent reads all digests and writes OVERVIEW.md + comparison matrix', model: 'opus' },
  ],
}

// Baked at dig-init.
const DIG = '__DIG_PATH__'
const TOPIC = '__TOPIC__'
const META = DIG + '/_meta'

// Idempotency marker. Bump this line (e.g. pass-2, pass-3) before re-consolidating after more waves,
// so finished digests with the OLD label get rebuilt and a crashed pass with the SAME label skips
// what it already wrote. The skill edits this one line between passes.
const CONSOLIDATION_LABEL = 'pass-1'

const TOOL_BOOT = ' --- TOOLING: if Glob / Grep / Read / Write are not available, FIRST call ToolSearch "select:Glob,Grep,Read,Write" to load them.'

const TEMPLATE_SUB =
  '---\nsubtopic: <canonical name>\nslug: <slug>\nkind: subtopic\nconsolidated_from: <N entries>\nconsolidated: ' + CONSOLIDATION_LABEL + '\n---\n\n' +
  '# <Subtopic> — consolidated guide\n\n' +
  '## What it is / current state & dates\n' +
  '## Core findings  (each tier-tagged [A]/[B]/[C]/[D] + source)\n' +
  '## Key specifics / parameters / how-to\n' +
  '## Worked examples  (concrete, attributed)\n' +
  '## Caveats, failure modes & fixes\n' +
  '## Conflicts / drift between sources\n' +
  '## Sources (deduped, grouped by tier)\n'

const TEMPLATE_CROSS =
  '---\ntopic: <topic>\nslug: <slug>\nkind: cross-cutting\nconsolidated_from: <N entries across M subtopics>\nconsolidated: ' + CONSOLIDATION_LABEL + '\n---\n\n' +
  '# <Theme> across subtopics — consolidated\n\n' +
  '## Universal principles\n' +
  '## Per-subtopic specifics  (table or list)\n' +
  '## Recommended recipes\n' +
  '## Pitfalls\n' +
  '## Sources (tier-tagged)\n'

// ---- Load taxonomy (Workflow scripts have no fs; an agent reads it) ----
phase('Load')
const TAX_SCHEMA = {
  type: 'object',
  required: ['subtopics', 'crosscutting'],
  properties: {
    subtopics: { type: 'array', items: { type: 'object', required: ['slug', 'title'], properties: { slug: { type: 'string' }, title: { type: 'string' }, globs: { type: 'array', items: { type: 'string' } } } } },
    crosscutting: { type: 'array', items: { type: 'object', required: ['slug', 'title', 'grep'], properties: { slug: { type: 'string' }, title: { type: 'string' }, grep: { type: 'string' } } } },
  },
}
const tax = await agent(
  'Read ' + META + '/taxonomy.json and return its "subtopics" array (each {slug, title, globs}) and "crosscutting" array (each {slug, title, grep}). If a subtopic has no globs, use ["*." + slug + ".*"]. Copy exactly.' + TOOL_BOOT,
  { label: 'load-taxonomy', phase: 'Load', schema: TAX_SCHEMA }
)
const SUBS = (tax && tax.subtopics) || []
const CROSS = (tax && tax.crosscutting) || []
if (!SUBS.length && !CROSS.length) return { ok: false, note: 'taxonomy.json missing or empty — run scout first' }
log('consolidating ' + SUBS.length + ' subtopics + ' + CROSS.length + ' cross-cutting themes (label ' + CONSOLIDATION_LABEL + ')')

phase('Consolidate')
const subJobs = SUBS.map(s => () =>
  agent(
    'You are consolidating a deep-research knowledge base on:\n  "' + TOPIC + '"\nBuild the AUTHORITATIVE digest for the subtopic: ' + s.title + ' (slug: ' + s.slug + ')\n\n' +
    'STEP 0 (idempotency): Read ' + DIG + '/subtopics/' + s.slug + '.md if it exists. If its frontmatter "consolidated:" line ALREADY equals "' + CONSOLIDATION_LABEL + '", reply exactly "SKIP ' + s.slug + '" and STOP.\n' +
    'STEP 1: Glob under ' + DIG + '/entries/ : ' + ((s.globs && s.globs.length ? s.globs : ['*.' + s.slug + '.*']).join(' , ')) + ' . Read the matching .md entries (prioritize tier-A/B and the most substantive; you need not quote every example). Ignore clearly off-topic entries.\n' +
    'STEP 2: Synthesize ONE clean, DEDUPLICATED, TIGHT guide (aim 120-220 lines — synthesize, do not transcribe). Merge duplicate claims; on conflict prefer the highest credibility tier and NOTE the conflict + dates. Keep every claim tier-tagged [A]/[B]/[C]/[D] with its source URL. This digest is the go-to reference; raw entries are the audit trail.\n' +
    'STEP 3: WRITE the digest to ' + DIG + '/subtopics/' + s.slug + '.md using this template:\n' + TEMPLATE_SUB + '\n' +
    'STEP 4: After the file is written, reply with ONE short line: DONE ' + s.slug + ' (merged N entries). Do not call any tool after the Write.' +
    TOOL_BOOT,
    { label: 'sub:' + s.slug, phase: 'Consolidate', model: 'opus' }
  ).catch(() => null)
)

const crossJobs = CROSS.map(c => () =>
  agent(
    'You are building a CROSS-CUTTING guide for a deep-research knowledge base on:\n  "' + TOPIC + '"\nTheme: ' + c.title + ' (slug: ' + c.slug + ')\n\n' +
    'STEP 0 (idempotency): Read ' + DIG + '/cross-cutting/' + c.slug + '.md if it exists. If its frontmatter "consolidated:" line ALREADY equals "' + CONSOLIDATION_LABEL + '", reply exactly "SKIP ' + c.slug + '" and STOP.\n' +
    'STEP 1: Grep (case-insensitive) ' + DIG + '/entries/ for: ' + c.grep + ' . Read the entries with substantive content on this theme across DIFFERENT subtopics.\n' +
    'STEP 2: Synthesize a TIGHT cross-cutting guide (aim 120-200 lines): universal principles first, then per-subtopic specifics/differences (a table works well), then concrete recipes and pitfalls. Tier-tag claims [A]/[B]/[C]/[D] with sources.\n' +
    'STEP 3: WRITE to ' + DIG + '/cross-cutting/' + c.slug + '.md using this template:\n' + TEMPLATE_CROSS + '\n' +
    'STEP 4: After the file is written, reply with ONE short line: DONE ' + c.slug + '. Do not call any tool after the Write.' +
    TOOL_BOOT,
    { label: 'cross:' + c.slug, phase: 'Consolidate', model: 'opus' }
  ).catch(() => null)
)

// Run in small batches — gentler on server-side rate limits during sustained load.
const ALL = [...subJobs, ...crossJobs]
const CHUNK = 6
const results = []
for (let i = 0; i < ALL.length; i += CHUNK) {
  const r = await parallel(ALL.slice(i, i + CHUNK))
  results.push(...r.filter(Boolean))
  log('consolidation batch ' + (Math.floor(i / CHUNK) + 1) + ' done (' + results.length + ' responses so far)')
}

// ---- Overview + comparison matrix ----
phase('Overview')
const subList = SUBS.map(s => s.slug).join(', ')
const overviewMsg = await agent(
  'You are writing the MASTER OVERVIEW for a deep-research knowledge base on:\n  "' + TOPIC + '"\n\n' +
  'STEP 1: Read the consolidated digests under ' + DIG + '/subtopics/ (slugs: ' + subList + ') and ' + DIG + '/cross-cutting/ . Skim, do not transcribe.\n' +
  'STEP 2: WRITE ' + DIG + '/OVERVIEW.md with frontmatter (title, consolidated: ' + CONSOLIDATION_LABEL + ') then:\n' +
  '  - "## What this is" — 1 paragraph.\n' +
  '  - "## How to read it" — explain subtopics/ vs cross-cutting/ and the A/B/C/D credibility tiers.\n' +
  '  - "## Cheatsheet" — 8-15 numbered, tier-tagged, genuinely useful takeaways that span the whole topic.\n' +
  '  - "## Comparison matrix" — ONE or more markdown tables comparing the subtopics along the dimensions that matter MOST for THIS topic (you choose the columns — make them decision-useful). Keep cells terse.\n' +
  '  - "## Per-subtopic one-liners" — one sharp sentence per subtopic.\n' +
  'Tier-tag claims where it matters. After writing, reply ONE line: DONE overview. Do not call any tool after the Write.' +
  TOOL_BOOT,
  { label: 'overview', phase: 'Overview', model: 'opus' }
).catch(() => null)

const throttled = results.filter(r => /temporarily limiting|rate limit|API Error/i.test(String(r)))
const skipped = results.filter(r => /^SKIP /.test(String(r)))
return {
  kind: 'consolidation',
  label: CONSOLIDATION_LABEL,
  attempted: SUBS.length + CROSS.length,
  responded: results.length,
  skipped_already_done: skipped.length,
  throttled: throttled.length,
  overview: String(overviewMsg || '(overview failed)').slice(0, 80),
  sample: results.slice(0, 10).map(r => String(r).slice(0, 80)),
}
