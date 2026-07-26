// process-wave.js — per-wave persistence for the kopatel dig loop. Two ingestion modes:
//
//   node process-wave.js <workflow-output-file> <waveNumber>   (interactive: Workflow result file)
//   node process-wave.js --sidecars <waveNumber>               (headless: per-agent sidecar JSONs)
//
// Sidecar mode reads _meta/wave-out/w<N>-*.json — each research agent wrote its own small file
// (id, target, entry_path, claim_count, new_frontier, sources), so nothing passes through the
// orchestrator's context at all. Useful for supervised runs that persist one sidecar per agent.
// Either way: accumulates `seen` targets, builds the next wave's frontier (dedup + minus seen),
// merges sources, updates frontier.md / sources.md / CHANGELOG.md, bumps dig.json. SHORT report.
//
// Plain Node (run via Bash) — Date / fs fine here.

const fs = require('fs');
const path = require('path');

// Stop-signal heuristics — tunable defaults, not truth (calibrate by runs).
const SATURATION_RATE_THRESHOLD = 0.20; // new entries < 20% of avg over last <=3 waves
const SATURATION_MIN_WAVES = 3;         // do not signal until history has at least 3 waves
const D_TIER_WARN_SHARE = 0.50;         // > 50% D-tier entries in wave

const [, , a1, a2] = process.argv;
if (!a1 || !a2) { console.error('usage: node process-wave.js <output-file> <wave>  |  node process-wave.js --sidecars <wave>'); process.exit(2); }

const DIG = '__DIG_PATH__';
const META = path.join(DIG, '_meta');

let data, wave;
if (a1 === '--sidecars') {
  wave = parseInt(a2, 10);
  if (!Number.isInteger(wave)) { console.error('BAD wave number: ' + a2); process.exit(2); }
  const dir = path.join(META, 'wave-out');
  const rx = new RegExp('^w' + wave + '-\\d+\\.json$');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => rx.test(f)) : [];
  if (!files.length) { console.error('NO SIDECARS for wave ' + wave + ' in ' + dir); process.exit(3); }
  const rows = files.map(f => {
    try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
    catch (e) { console.error('BAD SIDECAR ' + f + ': ' + e.message); return null; }
  }).filter(Boolean);
  data = {
    wave,
    entries_written: rows.filter(r => (r.claim_count || 0) > 0).map(r => ({ id: r.id, subtopic_slug: r.subtopic_slug, path: r.entry_path, claims: r.claim_count, summary: r.summary, tier: r.tier })),
    // dups (claim_count 0) still count as researched — their target must enter `seen`.
    researched_targets: rows.filter(r => r.target).map(r => ({ subtopic_slug: r.subtopic_slug, target: r.target })),
    new_frontier: rows.flatMap(r => Array.isArray(r.new_frontier) ? r.new_frontier : []),
    sources_seen: rows.flatMap(r => Array.isArray(r.sources) ? r.sources : []),
    per_subtopic: rows.reduce((m, r) => { if ((r.claim_count || 0) > 0) m[r.subtopic_slug] = (m[r.subtopic_slug] || 0) + 1; return m; }, {}),
    total_claims: rows.reduce((s, r) => s + (r.claim_count || 0), 0),
  };
  console.log('sidecar mode: ' + rows.length + '/' + files.length + ' sidecars parsed for wave ' + wave);
} else {
  const raw = fs.readFileSync(a1, 'utf8');
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (e) {
    const i = raw.indexOf('{'); const j = raw.lastIndexOf('}');
    if (i < 0 || j < 0) { console.error('CANNOT PARSE output file as JSON'); process.exit(3); }
    parsed = JSON.parse(raw.slice(i, j + 1));
  }
  // Workflow output wraps the return value: { summary, agentCount, logs, result: {...} }
  data = parsed.result || parsed;
  wave = Number.isInteger(data.wave) ? data.wave : parseInt(a2, 10);
}
const nextWave = wave + 1;

const deferred = Array.isArray(data.deferred_frontier) ? data.deferred_frontier : [];
const news = Array.isArray(data.new_frontier) ? data.new_frontier : [];
const sources = Array.isArray(data.sources_seen) ? data.sources_seen : [];
const entries = Array.isArray(data.entries_written) ? data.entries_written : [];
const researched = Array.isArray(data.researched_targets) ? data.researched_targets : [];
const perSubtopic = data.per_subtopic || {};
const dTierCount = entries.filter(e => String((e && e.tier) || '').toUpperCase() === 'D').length;

function norm(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/^https?:\/\//, '').replace(/^www\./, '')
    .replace(/[\/#?]+$/, '').replace(/\s+/g, ' ');
}

// ---- cumulative seen targets ----
const seenPath = path.join(META, 'seen.json');
let seenObj = fs.existsSync(seenPath) ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) : { targets: [] };
const seenSet = new Set((seenObj.targets || []).map(norm));
for (const r of researched) { if (r && r.target) seenSet.add(norm(r.target)); }

// ---- remaining-after-this-wave ----
// The file that FED this wave (frontier-wN.json) is the source of truth for the full pending list;
// subtract the batch this wave actually researched. Fall back to deferred_frontier if absent.
let remaining;
const fedPath = path.join(META, `frontier-w${wave}.json`);
if (fs.existsSync(fedPath)) {
  const fed = (JSON.parse(fs.readFileSync(fedPath, 'utf8')).pending) || [];
  const rset = new Set(researched.map(r => norm(r.target)));
  remaining = fed.filter(p => !rset.has(norm(p.query_or_url)));
} else {
  remaining = deferred;
}

// ---- build next pending: dedup(remaining + new) minus seen ----
const byKey = new Map();
let droppedSeen = 0, droppedDup = 0;
for (const it of [...remaining, ...news]) {
  if (!it || !it.query_or_url) continue;
  const key = norm(it.query_or_url);
  if (seenSet.has(key)) { droppedSeen++; continue; }
  const prev = byKey.get(key);
  if (!prev) byKey.set(key, it);
  else { droppedDup++; if ((it.priority || 2) < (prev.priority || 2)) byKey.set(key, it); }
}
const pending = [...byKey.values()].sort((a, b) => (a.priority || 2) - (b.priority || 2));

fs.writeFileSync(path.join(META, `frontier-w${nextWave}.json`), JSON.stringify({ wave: nextWave, pending }), 'utf8');
fs.writeFileSync(seenPath, JSON.stringify({ targets: [...seenSet] }), 'utf8');

// ---- cumulative sources ----
const srcPath = path.join(META, 'sources.json');
let srcAll = fs.existsSync(srcPath) ? JSON.parse(fs.readFileSync(srcPath, 'utf8')) : {};
let newSrc = 0;
for (const s of sources) {
  if (!s || !s.url) continue;
  const k = norm(s.url);
  if (!srcAll[k]) { srcAll[k] = { url: s.url, title: s.title || '', tier: s.tier || '', first_wave: wave }; newSrc++; }
}
fs.writeFileSync(srcPath, JSON.stringify(srcAll), 'utf8');

// ---- render sources.md (grouped by tier) ----
const tiers = { A: [], B: [], C: [], D: [], '': [] };
for (const k of Object.keys(srcAll)) { const s = srcAll[k]; (tiers[s.tier] || tiers['']).push(s); }
let smd = `# Sources registry (cumulative, deduped)\n\nTotal: ${Object.keys(srcAll).length} unique sources. Updated through wave ${wave}.\n\n`;
for (const t of ['A', 'B', 'C', 'D', '']) {
  const arr = tiers[t]; if (!arr.length) continue;
  const label = t ? `Tier ${t}` : 'Untagged';
  smd += `## ${label} (${arr.length})\n`;
  for (const s of arr.sort((a, b) => a.url.localeCompare(b.url))) {
    smd += `- ${s.title ? s.title + ' — ' : ''}${s.url}${s.first_wave ? ` _(w${s.first_wave})_` : ''}\n`;
  }
  smd += '\n';
}
fs.writeFileSync(path.join(DIG, 'sources.md'), smd, 'utf8');

// ---- render frontier.md (human view of pending) ----
const bySub = {};
for (const it of pending) { (bySub[it.subtopic_slug] = bySub[it.subtopic_slug] || []).push(it); }
let fmd = `# Frontier — pending research queue (wave ${nextWave})\n\n`;
fmd += `${pending.length} pending items. Dropped this pass: ${droppedSeen} already-seen, ${droppedDup} intra-batch dups.\n`;
fmd += `Regenerated each wave by _meta/process-wave.js. Machine copy: _meta/frontier-w${nextWave}.json.\n\n`;
for (const m of Object.keys(bySub).sort()) {
  fmd += `## ${m} (${bySub[m].length})\n`;
  for (const it of bySub[m]) {
    fmd += `- [p${it.priority || 2}] (${it.source_type}) ${it.query_or_url} — ${it.why}\n`;
  }
  fmd += '\n';
}
fs.writeFileSync(path.join(DIG, 'frontier.md'), fmd, 'utf8');

// ---- CHANGELOG append ----
const clPath = path.join(DIG, 'CHANGELOG.md');
let cl = fs.existsSync(clPath) ? fs.readFileSync(clPath, 'utf8') : '# CHANGELOG — kopatel waves\n\n';
const pmLine = Object.keys(perSubtopic).sort().map(m => `${m}:${perSubtopic[m]}`).join(', ');
cl += `## Wave ${wave}\n`;
cl += `- entries written: ${entries.length} (total claims: ${data.total_claims ?? '?'})\n`;
cl += `- per-subtopic: ${pmLine || '(n/a)'}\n`;
cl += `- new sources: +${newSrc} (cumulative ${Object.keys(srcAll).length})\n`;
cl += `- next frontier: ${pending.length} pending (dropped ${droppedSeen} seen, ${droppedDup} dups)\n\n`;
fs.writeFileSync(clPath, cl, 'utf8');

// ---- bump dig.json ----
const digPath = path.join(META, 'dig.json');
if (fs.existsSync(digPath)) {
  const dj = JSON.parse(fs.readFileSync(digPath, 'utf8'));
  dj.waves_done = wave;
  dj.status = 'digging';
  fs.writeFileSync(digPath, JSON.stringify(dj, null, 2), 'utf8');
}

// ---- wave stop-signal telemetry ----
const statsPath = path.join(META, 'wave-stats.json');
const waveStats = fs.existsSync(statsPath) ? JSON.parse(fs.readFileSync(statsPath, 'utf8')) : [];
const recentStats = waveStats.slice(-3);
const avg3 = recentStats.length ? recentStats.reduce((s, r) => s + (r.entries || 0), 0) / recentStats.length : 0;
const saturationRate = avg3 > 0 ? entries.length / avg3 : (entries.length > 0 ? 1 : 0);
const lowSaturation = waveStats.length >= SATURATION_MIN_WAVES && avg3 > 0 && saturationRate < SATURATION_RATE_THRESHOLD;
const dTierShare = entries.length > 0 ? dTierCount / entries.length : 0;
const qualityWarn = dTierShare > D_TIER_WARN_SHARE;
waveStats.push({ wave, entries: entries.length, d_tier: dTierCount });
fs.writeFileSync(statsPath, JSON.stringify(waveStats, null, 2), 'utf8');

// ---- short report ----
console.log('=== wave ' + wave + ' processed ===');
console.log('entries_written : ' + entries.length + '  total_claims: ' + (data.total_claims ?? '?'));
console.log('per_subtopic    : ' + (pmLine || '(n/a)'));
console.log('sources         : +' + newSrc + ' new (cumulative ' + Object.keys(srcAll).length + ')');
console.log('seen targets    : ' + seenSet.size + ' cumulative');
console.log('next frontier   : ' + pending.length + ' pending  (dropped ' + droppedSeen + ' seen, ' + droppedDup + ' dups)');
console.log('next file       : _meta/frontier-w' + nextWave + '.json');
console.log('saturation: wave=' + wave + ' new_entries=' + entries.length + ' avg3=' + avg3.toFixed(2) + ' rate=' + saturationRate.toFixed(2) + (lowSaturation ? ' [LOW_SATURATION]' : ''));
console.log('quality:    d_tier=' + dTierCount + '/' + entries.length + ' share=' + dTierShare.toFixed(2) + (qualityWarn ? ' [QUALITY_WARN]' : ''));
const top = pending.slice(0, 8).map(it => `  [p${it.priority || 2}] ${it.subtopic_slug} <- ${String(it.query_or_url).slice(0, 70)}`);
console.log('top pending:\n' + top.join('\n'));
if (lowSaturation) console.log('\n*** LOW_SATURATION — consider broadening wave or stop ***');
if (pending.length === 0) console.log('\n*** FRONTIER DRY — loop should stop (or run a broadening/critic wave) ***');
