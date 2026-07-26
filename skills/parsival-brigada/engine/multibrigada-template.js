// multibrigada-template.js - master workflow for several brigada child runs.
// The raw template is syntax-checkable before placeholder replacement.
//
// Placeholders:
//   {{BATCH_SLUG}} {{BATCH_TITLE}} {{CHILDREN_JSON}} {{PARALLEL}}

const placeholder = (value, fallback) =>
  value.startsWith('{{') && value.endsWith('}}') ? fallback : value

const parseBoolPlaceholder = (value, fallback) => {
  const raw = placeholder(value, String(fallback)).trim()
  return raw === 'true'
}

const parseJsonPlaceholder = (value, fallback) => {
  const raw = placeholder(value, '')
  if (!raw) return fallback
  return JSON.parse(raw)
}

export const meta = {
  name: 'multibrigada-{{BATCH_SLUG}}',
  description: 'multibrigada: {{BATCH_TITLE}}',
  phases: [
    { title: 'Brigadas', detail: 'Run child brigadas; each child does brief -> assignment -> council -> verification -> gap fill -> synthesis' },
  ],
}

const CHILDREN = parseJsonPlaceholder(String.raw`{{CHILDREN_JSON}}`, [])
const PARALLEL = parseBoolPlaceholder('{{PARALLEL}}', false)

if (!CHILDREN.length) throw new Error('Empty brigada list')
log(`Brigadas in batch: ${CHILDREN.length}; mode: ${PARALLEL ? 'parallel' : 'sequential'}`)

const runOne = async (child) => {
  log(`> ${child.name} - start`)
  try {
    const result = await workflow({ scriptPath: child.scriptPath })
    const stage = result && result.stage ? result.stage : 'unknown'
    log(`OK ${child.name} - ${stage === 'final' ? 'final' : 'stage: ' + stage}`)
    return {
      name: child.name,
      stage,
      reports: result && result.reports_count ? result.reports_count : 0,
      clarifications: result && result.clarifications_count ? result.clarifications_count : 0,
      doc_chars: result && result.document ? result.document.length : 0,
    }
  } catch (error) {
    log(`ERROR ${child.name} - ${error.message}`)
    return { name: child.name, stage: 'error', error: String(error.message || error) }
  }
}

let results
if (PARALLEL) {
  results = (await parallel(CHILDREN.map((child) => () => runOne(child)))).filter(Boolean)
} else {
  results = []
  for (const child of CHILDREN) results.push(await runOne(child))
}

const done = results.filter((result) => result.stage === 'final').length
log(`Batch complete: ${done}/${CHILDREN.length} brigadas reached synthesis`)
return { batch: results }
