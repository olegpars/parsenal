// init-dig.mjs — scaffold one self-contained "dig" (deep-research run) for the kopatel skill.
//
//   node init-dig.mjs "<topic text>" "<slug>" "<base-dir>"
//
// Creates  <base-dir>/<slug>/  with entries/ subtopics/ cross-cutting/ dist/ _meta/ ,
// copies every engine template into _meta/ , and bakes the dig path + topic
// into the copies (replacing __DIG_PATH__ / __TOPIC__ / __SLUG__).
//
// Why bake instead of pass args: Workflow scripts do NOT reliably receive `args`
// (they can arrive JSON-stringified, so args.x === undefined and defaults silently win).
// So every dig gets its OWN copy of the engine with the path written into the file.
// State then lives on disk, not in args — which also makes a dig resumable after a crash.
//
// Plain Node (run via Bash), so Date / fs are fine here (unlike the Workflow scripts).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ENGINE = path.dirname(fileURLToPath(import.meta.url));

// Two modes:
//   (default) scaffold a NEW dig — refuses if the dir already exists.
//   --adopt   attach/upgrade the engine onto an EXISTING dig dir (e.g. a KB built by the older
//             reference engine, or to push an engine update into a live dig). Never clobbers
//             content (entries/, digests, taxonomy.json, frontier/seen/sources) — only (re)writes
//             the engine copies in _meta/ and fills missing dirs. This is what makes kopatel ONE
//             engine that can both start fresh and continue/adopt an existing dig from disk.
const ADOPT = process.argv.includes('--adopt');
const pos = process.argv.slice(2).filter(a => !a.startsWith('--'));
const [topicArg, slugArg, baseArg] = pos;
if (!topicArg) {
  console.error('usage: node init-dig.mjs "<topic>" "<slug>" "<base-dir>" [--adopt]');
  process.exit(2);
}
const topic = topicArg.trim();
// Slug: prefer the explicit one the orchestrator passes (it can transliterate Cyrillic well).
// Fallback derives an ascii-ish slug; if nothing survives, use "dig".
function slugify(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
const slug = (slugArg && slugify(slugArg)) || slugify(topic) || 'dig';
const base = (baseArg && baseArg.trim()) || './digs';

const DIG = path.join(base, slug).replace(/\\/g, '/');
const exists = fs.existsSync(DIG);
if (exists && !ADOPT) {
  console.error('REFUSING: dig already exists at ' + DIG +
    '\n  - to CONTINUE it: just resume from the latest _meta/frontier-wN.json (no re-init needed)' +
    '\n  - to ATTACH/upgrade the engine onto it: re-run with --adopt');
  process.exit(3);
}
if (!exists && ADOPT) {
  console.error('NOTHING TO ADOPT: no dig at ' + DIG + ' (drop --adopt to scaffold a new one).');
  process.exit(3);
}

// mkdir is idempotent — in --adopt mode this only fills missing dirs, never clobbers content.
for (const d of ['', 'entries', 'subtopics', 'cross-cutting', 'dist', '_meta']) {
  fs.mkdirSync(path.join(DIG, d), { recursive: true });
}

// Templates to copy into the dig's _meta/. init-dig itself is NOT copied.
const TEMPLATES = [
  'scout.js', 'wave.js', 'process-wave.js', 'consolidation.js',
  'build-site.mjs', 'site-template.html', 'serve.mjs',
];

function bake(text) {
  return text
    .split('__DIG_PATH__').join(DIG)
    .split('__TOPIC__').join(topic.replace(/'/g, "\\'"))   // safe inside JS single-quoted strings
    .split('__SLUG__').join(slug);
}

for (const f of TEMPLATES) {
  const src = path.join(ENGINE, f);
  if (!fs.existsSync(src)) { console.error('MISSING template ' + f); process.exit(4); }
  fs.writeFileSync(path.join(DIG, '_meta', f), bake(fs.readFileSync(src, 'utf8')), 'utf8');
}

// dig manifest — orchestrator + heartbeat read this to know topic/slug/path/status.
// In --adopt mode keep any existing state (waves_done / status / consolidation_label); only refresh path.
const digJsonPath = path.join(DIG, '_meta', 'dig.json');
if (fs.existsSync(digJsonPath)) {
  const cur = JSON.parse(fs.readFileSync(digJsonPath, 'utf8'));
  cur.topic = cur.topic || topic; cur.slug = cur.slug || slug;
  cur.dig_path = DIG; cur.base = base; cur.engine_attached = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(digJsonPath, JSON.stringify(cur, null, 2), 'utf8');
} else {
  const manifest = {
    topic, slug, dig_path: DIG, base,
    created: new Date().toISOString().slice(0, 10),
    status: ADOPT ? 'adopted' : 'scaffolded',   // scaffolded -> scouted -> digging -> consolidated -> built
    waves_done: 0,
    consolidation_label: 'pass-1',
  };
  fs.writeFileSync(digJsonPath, JSON.stringify(manifest, null, 2), 'utf8');
}

// README stub so the dig folder is self-explanatory if found cold (don't overwrite an existing one).
const readme = `# Dig: ${topic}

Deep-research knowledge base built by the **kopatel** skill.

- \`entries/\`       raw audit trail — one file per researched source (\`<id>.<subtopic>.<short>.md\`)
- \`subtopics/\`     consolidated digest per subtopic (the product)
- \`cross-cutting/\` consolidated digest per cross-cutting theme
- \`dist/\`          single-file website (\`index.html\`)
- \`_meta/\`         engine (self-contained copies), \`taxonomy.json\`, \`frontier-w*.json\`, state

Resume: the highest-numbered \`_meta/frontier-wN.json\` is the live queue. Re-run waves from there.
`;
const readmePath = path.join(DIG, 'README.md');
if (!fs.existsSync(readmePath)) fs.writeFileSync(readmePath, readme, 'utf8');

console.log('=== dig ' + (ADOPT ? 'engine attached (adopt)' : 'scaffolded') + ' ===');
console.log('topic : ' + topic);
console.log('slug  : ' + slug);
console.log('path  : ' + DIG);
if (ADOPT) {
  const hasTax = fs.existsSync(path.join(DIG, '_meta', 'taxonomy.json'));
  const frontiers = fs.readdirSync(path.join(DIG, '_meta')).filter(f => /^frontier-w\d+\.json$/.test(f));
  console.log('taxonomy.json : ' + (hasTax ? 'present' : 'MISSING — write one before consolidating (see references/adopt-existing.md)'));
  console.log('frontier files: ' + (frontiers.length ? frontiers.sort().join(', ') : 'none — seed frontier-w1.json (or run scout) to keep digging'));
  console.log('next  : resume the wave loop from the latest frontier, or re-consolidate + build-site with the unified engine');
} else {
  console.log('next  : run scout  ->  Workflow { scriptPath: "' + DIG + '/_meta/scout.js" }');
}
