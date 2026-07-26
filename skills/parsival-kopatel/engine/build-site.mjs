// build-site.mjs — builds <dig>/dist/index.html from the consolidated digests + OVERVIEW.md +
// taxonomy.json by injecting them into _meta/site-template.html. Self-contained single-file site.
//   node _meta/build-site.mjs
// Plain Node (run via Bash).
import fs from 'node:fs';
import path from 'node:path';

const DIG = '__DIG_PATH__';
const META = path.join(DIG, '_meta');
const DIST = path.join(DIG, 'dist');

function read(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null; }
function stripFm(s) {
  if (!s) return { body: '', fm: {} };
  const m = s.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { body: s, fm: {} };
  const fm = {}; m[1].split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) fm[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  return { body: s.slice(m[0].length), fm };
}

const tax = JSON.parse(read(path.join(META, 'taxonomy.json')) || '{}');
const groups = Array.isArray(tax.groups) ? tax.groups : [];
const subtopics = Array.isArray(tax.subtopics) ? tax.subtopics : [];
const crosscutting = Array.isArray(tax.crosscutting) ? tax.crosscutting : [];
const site = tax.site || {};

const docs = [];

// overview first (contains the comparison matrix)
const ov = read(path.join(DIG, 'OVERVIEW.md'));
if (ov) { const { body, fm } = stripFm(ov); docs.push({ id: 'overview', group: 'overview', groupLabel: 'Start here', title: 'Overview & comparison matrix', meta: fm.consolidated || '', md: body }); }

// subtopics, grouped per taxonomy.groups order (any leftover group falls to the end)
const groupOrder = groups.map(g => g.id);
const groupLabel = {}; groups.forEach(g => { groupLabel[g.id] = g.label; });
const seenGroups = new Set();
function emitGroup(gid) {
  if (seenGroups.has(gid)) return; seenGroups.add(gid);
  subtopics.filter(s => s.group === gid).forEach(s => {
    const { body, fm } = stripFm(read(path.join(DIG, 'subtopics', s.slug + '.md')));
    if (!body) { console.error('MISSING subtopic', s.slug); return; }
    docs.push({ id: 'sub-' + s.slug, group: gid, groupLabel: groupLabel[gid] || gid, title: s.title || s.slug, meta: fm.consolidated || '', md: body });
  });
}
groupOrder.forEach(emitGroup);
// any subtopic whose group wasn't in taxonomy.groups
[...new Set(subtopics.map(s => s.group))].filter(g => !seenGroups.has(g)).forEach(emitGroup);

// cross-cutting as a final group
crosscutting.forEach(c => {
  const { body, fm } = stripFm(read(path.join(DIG, 'cross-cutting', c.slug + '.md')));
  if (!body) { console.error('MISSING cross-cutting', c.slug); return; }
  docs.push({ id: 'cross-' + c.slug, group: 'cross', groupLabel: 'Cross-cutting', title: c.title || c.slug, meta: fm.consolidated || '', md: body });
});

// headline stats
const entryCount = fs.existsSync(path.join(DIG, 'entries')) ? fs.readdirSync(path.join(DIG, 'entries')).filter(f => f.endsWith('.md')).length : 0;
let sources = '?';
try { sources = Object.keys(JSON.parse(read(path.join(META, 'sources.json')))).length; } catch (e) {}
let built = '';
try { built = (JSON.parse(read(path.join(META, 'dig.json'))) || {}).created || ''; } catch (e) {}

const KBDATA = {
  meta: {
    eyebrow: site.eyebrow || 'Deep-research reference',
    brand: site.brand || tax.topic || 'Knowledge base',
    brand_sub: site.brand_sub || '',
    title: site.title || tax.topic || 'Knowledge base',
    tagline: site.tagline || 'Distilled from primary sources first, then expert and community sources. Every claim tier-tagged by credibility.',
    stats: [
      { n: String(docs.length - (ov ? 1 : 0)), l: 'subtopic & theme guides' },
      { n: String(entryCount), l: 'researched entries' },
      { n: String(sources), l: 'unique sources' },
      { n: 'A–D', l: 'credibility tiers' },
    ],
    foot: site.foot || 'kopatel dig',
    built,
  },
  docs,
};

const tpl = read(path.join(META, 'site-template.html'));
if (!tpl) { console.error('template missing'); process.exit(1); }
const json = JSON.stringify(KBDATA).replace(/<\//g, '<\\/'); // prevent </script> breakout
const out = tpl.replace('/*__KB_DATA__*/', 'window.__KB__ = ' + json + ';');

fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), out, 'utf8');
console.log('built dist/index.html · ' + docs.length + ' docs · ' + (out.length / 1024 | 0) + ' KB · entries ' + entryCount + ' · sources ' + sources);
