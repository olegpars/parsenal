#!/usr/bin/env node
// Extract a final brigada document from a Workflow task output JSON without
// loading the full reports and verification payload into the main session.
// Usage: node extract-doc.mjs <task-output.json> <out.md>

import fs from 'node:fs'
import path from 'node:path'

const [src, dst] = process.argv.slice(2)
if (!src || !dst) {
  console.error('usage: node extract-doc.mjs <task-output.json> <out.md>')
  process.exit(1)
}

const payload = JSON.parse(fs.readFileSync(src, 'utf8'))
const result = payload.result || {}
if (result.stage !== 'final') {
  console.log('STAGE:' + (result.stage || 'unknown'))
  process.exit(0)
}

if (!result.document || typeof result.document !== 'string') {
  console.error('final result has no document string')
  process.exit(2)
}

fs.mkdirSync(path.dirname(dst), { recursive: true })
fs.writeFileSync(dst, result.document)
console.log(`OK doc=${result.document.length} chars, reports=${result.reports_count}, clarifications=${result.clarifications_count}`)
