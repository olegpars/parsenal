// brigada-template.js - one-shot multi-agent expert council workflow.
// The orchestrator replaces placeholders before starting Workflow. The raw
// template is intentionally syntax-checkable before replacement.
//
// Placeholders:
//   {{TOPIC_SLUG}} {{TOPIC_TITLE}} {{MODE}} {{OUTPUT_LANG}}
//   {{PREVIEW}} {{ROLES_MIN}} {{ROLES_MAX}} {{VERIFY}} {{CLARIFY_CAP}}
//   {{DATE}} {{RAW_CONTEXT_JSON}} {{ARTIFACTS_JSON}} {{OUT_PATH_JSON}}

const placeholder = (value, fallback) =>
  value.startsWith('{{') && value.endsWith('}}') ? fallback : value

const parseBoolPlaceholder = (value, fallback) => {
  const raw = placeholder(value, String(fallback)).trim()
  return raw === 'true'
}

const parseIntPlaceholder = (value, fallback) => {
  const raw = placeholder(value, String(fallback)).trim()
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseJsonPlaceholder = (value, fallback) => {
  const raw = placeholder(value, '')
  if (!raw) return fallback
  return JSON.parse(raw)
}

export const meta = {
  name: 'brigada-{{TOPIC_SLUG}}',
  description: 'brigada: {{TOPIC_TITLE}}',
  phases: [
    { title: 'Brief', detail: 'Opus brief architect', model: 'opus' },
    { title: 'Assignment', detail: 'Opus designs roles, personas, and sharp questions', model: 'opus' },
    { title: 'Council', detail: 'Sonnet expert personas inspect artifacts and research the web' },
    { title: 'Verification', detail: 'Opus verifier plus Sonnet adversarial critic' },
    { title: 'Gap Fill', detail: 'Sonnet targeted checks on remaining gaps' },
    { title: 'Synthesis', detail: 'Opus writes the final markdown document', model: 'opus' },
  ],
}

const MODE = placeholder('{{MODE}}', 'decision')
const OUTPUT_LANG = placeholder('{{OUTPUT_LANG}}', 'en')
const PREVIEW = parseBoolPlaceholder('{{PREVIEW}}', false)
const ROLES_MIN = parseIntPlaceholder('{{ROLES_MIN}}', 6)
const ROLES_MAX = parseIntPlaceholder('{{ROLES_MAX}}', 8)
const VERIFY = parseBoolPlaceholder('{{VERIFY}}', MODE === 'decision')
const CLARIFY_CAP = parseIntPlaceholder('{{CLARIFY_CAP}}', 8)
const DATE = placeholder('{{DATE}}', 'YYYY-MM-DD')
const RAW_CONTEXT = parseJsonPlaceholder(String.raw`{{RAW_CONTEXT_JSON}}`, '')
const ARTIFACTS = parseJsonPlaceholder(String.raw`{{ARTIFACTS_JSON}}`, [])
const OUT_PATH = parseJsonPlaceholder(String.raw`{{OUT_PATH_JSON}}`, './councils/brigada.md')

const LANG = {
  en: {
    instruction: 'Write ONLY in English. Keep platform, people, product, and work names in the original.',
    none: 'None',
    briefTitle: 'Brief',
    modeDecision: 'DECISION - the council researches the topic so the user can choose a strategy or action.',
    modeUnderstanding: 'UNDERSTANDING - the council builds a fast map of the topic; no decision is required.',
    artifactsRequired: 'MUST inspect these artifacts yourself with the Read tool:',
    artifactsNone: '(no local artifacts were provided)',
    decisionSections: `# Brigada: {{TOPIC_TITLE}} - ${DATE}
(header: mode, one-line council roster, run context)
## Context and Goal
## Consensus
## Hard Data
## Contested Points
## Dubious Claims
## Missing Angles
## Strategy
## Open questions for the user (only truly blocking; otherwise - "None")
## Decisions
_Filled after discussion._`,
    understandingSections: `# Brigada: {{TOPIC_TITLE}} - ${DATE}
(header: mode, one-line council roster, run context)
## Topic Map
## Main Takeaways
## Hard Data
## Disputes and Uncertainty
## Dubious Claims
## Missing Angles
## Where to Dig Next
## Open questions for the user (only truly blocking; otherwise - "None")`,
    synthesisRule: 'For the open-questions section, fill ONLY if the final conclusion is fundamentally impossible without the user answer. If there are no such questions, write "None". If uncertainty can be resolved by a reasonable assumption, state the assumption in the document instead of asking.',
  },
  ru: {
    instruction: 'Пиши ТОЛЬКО по-русски. Имена платформ, людей, продуктов и произведений оставляй в оригинале.',
    none: 'Нет',
    briefTitle: 'Бриф',
    modeDecision: 'РЕШЕНИЕ - бригада копает тему, чтобы пользователь выбрал стратегию или действие.',
    modeUnderstanding: 'ПОНИМАНИЕ - бригада строит быструю карту темы; решение не требуется.',
    artifactsRequired: 'ОБЯЗАТЕЛЬНО посмотри эти артефакты сам через Read:',
    artifactsNone: '(локальных артефактов нет)',
    decisionSections: `# Бригада: {{TOPIC_TITLE}} - ${DATE}
(шапка: режим, состав бригады одной строкой, run-контекст)
## Контекст и цель
## Консенсус
## Жесткие данные
## Спорные узлы
## Сомнительное
## Упущенные углы
## Стратегия
## Открытые вопросы к пользователю (только реально блокирующие; иначе - "Нет")
## Решения
_Заполняется после обсуждения._`,
    understandingSections: `# Бригада: {{TOPIC_TITLE}} - ${DATE}
(шапка: режим, состав бригады одной строкой, run-контекст)
## Карта темы
## Главное
## Жесткие данные
## Споры и неопределенности
## Сомнительное
## Упущенные углы
## Куда копать дальше
## Открытые вопросы к пользователю (только реально блокирующие; иначе - "Нет")`,
    synthesisRule: 'Секцию открытых вопросов заполняй ТОЛЬКО если без ответа пользователя финальный вывод принципиально невозможен. Если таких вопросов нет, пиши "Нет". Неопределенность, которую можно закрыть разумным допущением, оформляй как допущение в тексте, а не как вопрос.',
  },
}

const L = LANG[OUTPUT_LANG] || LANG.en
const WEB = 'Load web tools with ToolSearch for "select:WebSearch,WebFetch", then search. Use the freshest reliable data, usually from the last 1-2 years. If data is unavailable, say so plainly and do not invent.'
const artifactsBlock = ARTIFACTS.length
  ? `${L.artifactsRequired}\n${ARTIFACTS.map((p) => '- ' + p).join('\n')}`
  : L.artifactsNone

const ASSIGN_SCHEMA = {
  type: 'object',
  required: ['assignments'],
  properties: {
    assignments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['role', 'persona', 'questions'],
        properties: {
          role: { type: 'string', description: 'Short role name' },
          persona: { type: 'string', description: '2-3 sentences: background, temperament, lens' },
          questions: { type: 'array', items: { type: 'string' }, description: '3-6 sharp, checkable questions' },
        },
      },
    },
  },
}

const REPORT_SCHEMA = {
  type: 'object',
  required: ['role', 'summary', 'findings', 'recommendations', 'sources'],
  properties: {
    role: { type: 'string' },
    summary: { type: 'string', description: '3-5 sentences with the main point' },
    findings: { type: 'array', items: { type: 'string' }, description: 'Facts and insights with numbers, names, cases, dates' },
    recommendations: { type: 'array', items: { type: 'string' }, description: 'Concrete conclusions or actions tied to the brief' },
    sources: { type: 'array', items: { type: 'string' } },
  },
}

const VERIFY_SCHEMA = {
  type: 'object',
  required: ['confirmed', 'dubious', 'contradictions', 'gaps'],
  properties: {
    confirmed: { type: 'array', items: { type: 'string' } },
    dubious: {
      type: 'array',
      items: {
        type: 'object',
        required: ['claim', 'why'],
        properties: { claim: { type: 'string' }, why: { type: 'string' } },
      },
    },
    contradictions: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
  },
}

const CRITIQUE_SCHEMA = {
  type: 'object',
  required: ['weak_points', 'missing_angles', 'gaps'],
  properties: {
    weak_points: { type: 'array', items: { type: 'string' } },
    missing_angles: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
  },
}

const CLARIFY_SCHEMA = {
  type: 'object',
  required: ['gap', 'answer', 'sources'],
  properties: {
    gap: { type: 'string' },
    answer: { type: 'string', description: 'Focused 1-3 paragraph answer' },
    sources: { type: 'array', items: { type: 'string' } },
  },
}

phase('Brief')
const brief = await agent(
  `You are the brief architect for a multi-agent expert council. Council members cannot see the user conversation; your brief is their only context. Make it self-contained and operational.

Mode: ${MODE === 'decision' ? L.modeDecision : L.modeUnderstanding}

Raw context from the orchestrator:
${RAW_CONTEXT}

${artifactsBlock}
If artifacts are listed, open them yourself with Read and state what they are and why the council must inspect them.

Use this markdown structure, with no wrapper:
# ${L.briefTitle}: <topic>
## Decision or Topic Core
## User Context and Assets
## Goal and Success Criteria
## Constraints
## What the Council Must Check
## Artifacts

${L.instruction}`,
  { model: 'opus', label: 'brief:opus', phase: 'Brief' },
)
if (!brief || brief.length < 200) throw new Error('Brief architect returned an empty or too-short brief')

phase('Assignment')
const plan = await agent(
  `You design assignments for expert personas in a one-shot council. Build ${ROLES_MIN}-${ROLES_MAX} roles for the brief below.

${brief}

Requirements:
1. Each role needs a vivid persona: 2-3 sentences with background, temperament, and lens.
2. Include at least one hard contrarian using base rates and one pragmatic numbers-focused operator.
3. Give each role 3-6 sharp research questions with checkable answers: numbers, names, cases, dates, risks, or concrete examples.
4. The roles together must cover every open theme in the brief without duplicate work.
${MODE === 'decision'
    ? '5. Optimize for a decision: options, channels, costs, risks, feasibility, and tradeoffs under the user constraints.'
    : '5. Optimize for a topic map: structure, schools of thought, primary sources, live practice, myths, and unresolved disputes.'}

${L.instruction}`,
  { model: 'opus', label: 'assignment:opus', phase: 'Assignment', schema: ASSIGN_SCHEMA },
)
if (!plan || !plan.assignments || !plan.assignments.length) throw new Error('Assignment designer returned no assignments')
if (plan.assignments.length > ROLES_MAX) {
  log(`Assignment designer returned ${plan.assignments.length} roles; trimming to ${ROLES_MAX}`)
  plan.assignments = plan.assignments.slice(0, ROLES_MAX)
}
log(`Council: ${plan.assignments.map((a) => a.role).join(' | ')}`)

if (PREVIEW) {
  return { stage: 'preview', brief, assignments: plan.assignments }
}

phase('Council')
const personaPrompt = (a) => `You are ${a.role}. ${a.persona}

${brief}

Your questions. Answer EACH one:
${a.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Process:
1. Inspect artifacts named in the brief with Read before forming conclusions.
2. ${WEB} Run at least 4-6 meaningful searches unless the brief is entirely local.
3. Answer as the persona: have a point of view, but separate facts from opinions.
4. Be concrete: numbers, names, prices, dates, examples, and links.

${L.instruction}`

const reports = (await parallel(
  plan.assignments.map((a) => () =>
    agent(personaPrompt(a), { model: 'sonnet', label: `council:${a.role}`, phase: 'Council', schema: REPORT_SCHEMA }),
  ),
)).filter(Boolean)
log(`Reports: ${reports.length}/${plan.assignments.length}`)
if (!reports.length) throw new Error('No council member returned a report')
const reportsBlock = JSON.stringify(reports, null, 2)

phase('Verification')
let verification = null
let critique = null
const critiqueTask = () => agent(
  `You are an independent adversarial critic. The brief and ${reports.length} council reports are below. Find where the council is wrong, weak, overconfident, or incomplete.

${brief}

REPORTS:
${reportsBlock}

Critique:
1. Weak points: recommendations that do not match the brief, groupthink, unsupported numbers, fuzzy claims.
2. Missing angles: legal or ToS risk, jurisdiction and taxes, platform risk, competition, real time cost, alternative diagnoses.
3. Gaps for the fill round: concrete, checkable issues. Find at least two dubious claims. For each candidate user question, decide if it is truly blocking or can be handled by a reasonable assumption.
4. Do not propose your own strategy; critique only.

${L.instruction}`,
  { model: 'sonnet', label: 'critic:sonnet', phase: 'Verification', schema: CRITIQUE_SCHEMA },
)

if (VERIFY) {
  ;[verification, critique] = await parallel([
    () => agent(
      `You are the council verifier and senior fact-checking editor. The brief and ${reports.length} reports are below.

${brief}

REPORTS:
${reportsBlock}

Work:
1. Identify load-bearing claims and verify them across reports and the web. ${WEB} Run 3-6 checks on the highest-risk claims.
2. Mark dubious claims: unsourced numbers, stale data, wishful thinking, or claims that do not survive cross-checking.
3. Record contradictions between roles.
4. Record gaps that would materially change the conclusion.

${L.instruction}`,
      { model: 'opus', label: 'verifier:opus', phase: 'Verification', schema: VERIFY_SCHEMA },
    ),
    critiqueTask,
  ])
} else {
  critique = await critiqueTask()
}

const allGaps = []
if (verification && verification.gaps) allGaps.push(...verification.gaps)
if (critique && critique.gaps) allGaps.push(...critique.gaps)
const uniqueGaps = [...new Set(allGaps.map((g) => g.trim()))].filter((g) => g.length > 10)
let clarifications = []
if (uniqueGaps.length) {
  phase('Gap Fill')
  const topGaps = uniqueGaps.slice(0, CLARIFY_CAP)
  log(`Gap-fill tasks: ${topGaps.length}/${uniqueGaps.length}`)
  clarifications = (await parallel(
    topGaps.map((gap, i) => () =>
      agent(
        `Run a short targeted investigation into this remaining council gap.

Brief:
${brief}

GAP: ${gap}

${WEB} Use 2-4 searches. Give a concise answer with sources. If public data cannot answer it, say that directly and suggest a cheap way for the user to check it.

${L.instruction}`,
        { model: 'sonnet', label: `gap-fill:${i + 1}`, phase: 'Gap Fill', schema: CLARIFY_SCHEMA },
      ),
    ),
  )).filter(Boolean)
  if (uniqueGaps.length > CLARIFY_CAP) log(`Dropped over cap: ${uniqueGaps.length - CLARIFY_CAP}`)
}

phase('Synthesis')
const sections = MODE === 'decision' ? L.decisionSections : L.understandingSections
const document = await agent(
  `You are the final author for the expert council. Write a finished markdown document from the brief and every run artifact below.

${brief}

ROLE REPORTS:
${reportsBlock}

VERIFICATION:
${JSON.stringify(verification, null, 2)}

CRITIQUE:
${JSON.stringify(critique, null, 2)}

GAP FILL:
${JSON.stringify(clarifications, null, 2)}

Document structure, strictly:
${sections}

Synthesis rules:
- Separate verified facts from assumptions and model judgments.
- Preserve real disagreements between roles; do not smooth them into fake consensus.
- Honest calibration, usually from the skeptic, is more valuable than the most pleasant answer.
- Prefer concrete details: numbers, names, dates, and sources from the reports.
- Write finished prose, with no chat wrapper.
- ${L.synthesisRule}

Saving, mandatory and in this order:
1. Write the finished document with Write exactly to this path: ${OUT_PATH}
2. Then return the same document as final text, so it is available in result.document if file writing fails.

${L.instruction}`,
  { model: 'opus', label: 'synthesis:opus', phase: 'Synthesis' },
)
if (!document || document.length < 500) throw new Error('Synthesizer returned an empty or too-short document')

return {
  stage: 'final',
  brief,
  assignments: plan.assignments,
  reports_count: reports.length,
  verification,
  critique,
  clarifications_count: clarifications.length,
  document,
}
