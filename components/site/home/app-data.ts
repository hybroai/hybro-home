// Mock data for the interactive app preview on the home page. Names, colors and
// layout follow the Hybro app (hybro/frontend) in its dark theme.
import { AVATAR } from '../avatars'

export const CLAUDE = '/logos/claude.svg'
export const CODEX = '/logos/codex.svg'

// App tokens (dark theme).
export const APP = {
  card: 'hsl(223 14% 10%)',
  border: 'hsl(222 12% 16%)',
  mutedFg: 'hsl(218 12% 69%)',
  primary: 'hsl(186 62% 52%)',
  warning: 'hsl(38 85% 60%)',
  online: 'hsl(152 50% 52%)',
  offline: 'hsl(217 9% 54%)',
  edge: 'hsl(215 14% 26%)',
  agent: 'hsl(215 16% 62%)',
  canvas: 'hsl(216 15% 6%)',
  control: 'hsl(220 14% 12%)',
}

export type Agent = { name: string; img: string }

// ---------- Chats ----------

export type ChatStatus = 'done' | 'running' | 'needs'
export type Response = Agent & { task: string; done?: boolean }
export type Chat = {
  title: string
  status: ChatStatus
  agents: Agent[]
  prompt: string
  time: string
  answer: string
  responses: Response[]
}
export type ChatAnswer = '' | 'yes' | 'no'

const weather = { name: 'Weather Agent', img: AVATAR.weather }
const travel = { name: 'Travel Planner Agent', img: AVATAR.travel }
const story = { name: 'Story Agent', img: AVATAR.story }
const image = { name: 'Image Generator Agent', img: AVATAR.image }
const research = { name: 'Research Agent', img: AVATAR.story }
const data = { name: 'Data Agent', img: AVATAR.data }
const support = { name: 'Support Agent', img: AVATAR.image }

/** The five chats. The last one waits for the visitor's answer until they give one. */
export function getChats(answer: ChatAnswer): Chat[] {
  const supportChat: Chat = answer
    ? {
        title: 'Weekly support summary',
        status: 'done',
        agents: [support, data],
        prompt: "Summarize this week's support tickets and chart the three most common issues",
        time: '31.6s',
        answer:
          (answer === 'yes'
            ? 'You answered: include beta.\nSummary of 426 tickets (380 main, 46 beta).'
            : 'You answered: main workspace only.\nSummary of 380 tickets.') +
          '\nTop issues: login loops after SSO changes, CSV export timeouts, and missing invoice PDFs. Data Agent charted all three.',
        responses: [
          { ...support, task: "Summarize this week's tickets" },
          { ...data, task: 'Chart the top three issues' },
        ],
      }
    : {
        title: 'Weekly support summary',
        status: 'needs',
        agents: [support, data],
        prompt: "Summarize this week's support tickets and chart the three most common issues",
        time: '22.0s',
        answer: '',
        responses: [
          { ...support, task: "Summarize this week's tickets" },
          { ...data, task: 'Chart the top three issues', done: true },
        ],
      }
  return [
    {
      title: 'Oahu trip for four',
      status: 'done',
      agents: [weather, travel],
      prompt: "Plan a 7-day trip to Oahu for four people, and check Honolulu's weather for the week",
      time: '10.2s',
      answer:
        'Here is your 7-day Oahu plan.\nWeather: sunny, light trade winds, 27 to 29°C; a passing shower on Thursday, so the North Shore day moves to Wednesday.\nDay 1: Waikiki and Diamond Head at sunrise.\nDay 2: Pearl Harbor and downtown Honolulu.\nDay 3: North Shore beaches and shrimp trucks.',
      responses: [
        { ...weather, task: "Honolulu's forecast for the next 7 days" },
        { ...travel, task: '7-day Oahu itinerary for four people' },
      ],
    },
    {
      title: 'A story with a picture',
      status: 'done',
      agents: [story, image],
      prompt: 'Give me a short fun story about AI agents and generate an image based on the story',
      time: '14.8s',
      answer:
        "The Agents Who Shared a Desk\nA weather bot and a travel planner kept booking the same meeting room. One morning they read each other's notes and planned a picnic that dodged every cloud.\nThe image shows two small robots on a sunny hill, a map and an umbrella between them.",
      responses: [
        { ...story, task: 'Short story about AI agents' },
        { ...image, task: 'Illustration of the best scene' },
      ],
    },
    {
      title: 'Vector database shortlist',
      status: 'done',
      agents: [research, data],
      prompt: 'Compare five open-source vector databases on our sample data and write a one-page recommendation',
      time: '41.3s',
      answer:
        'Recommendation: start with the option that had the best recall at our data size, and keep the runner-up as a fallback.\nResearch Agent shortlisted five projects by license, activity and features.\nData Agent ran the same 10k-document benchmark on each and charted recall and latency.',
      responses: [
        { ...research, task: 'Shortlist and compare features' },
        { ...data, task: 'Benchmark on sample data' },
      ],
    },
    {
      title: 'Porto offsite plan',
      status: 'running',
      agents: [travel, weather],
      prompt: 'Draft a 3-day Q4 offsite in Porto for 12 people and check the weather for those dates',
      time: '8.4s',
      answer: '',
      responses: [
        { ...weather, task: 'Porto forecast for the offsite dates', done: true },
        { ...travel, task: '3-day plan for 12 people' },
      ],
    },
    supportChat,
  ]
}

export const CHAT_STATE: Record<ChatStatus, { state: string; color: string; label: string }> = {
  done: { state: 'Finished', color: '#4ADE80', label: '' },
  running: { state: 'Running', color: APP.primary, label: 'Running' },
  needs: { state: 'Needs input', color: APP.warning, label: 'Needs input' },
}

// ---------- Sessions ----------

export type SessionKind = 'working' | 'needs' | 'completed' | 'rejected'
export type Decision = '' | 'approved' | 'rejected'
export type Entry = { who: string; img?: string; action: string; actionColor: string; time: string; body: string }
export type Session = { name: string; kind: SessionKind; requester: string; agents: string; updated: string; entries: Entry[] }

export const SESSION_STATUS: Record<SessionKind, { label: string; color: string }> = {
  working: { label: 'Working', color: '#8C929C' },
  needs: { label: 'Needs you', color: '#E3A23B' },
  completed: { label: 'Completed', color: '#8C929C' },
  rejected: { label: 'Rejected', color: '#8C929C' },
}

const asked = (who: string, img: string, to: string, body: string): Entry => ({ who, img, action: `asked ${to}`, actionColor: '#8C929C', time: '10:02', body })

/** The five sessions. The first one waits for the visitor's approval. */
export function getSessions(decision: Decision): Session[] {
  const flat: Entry[] = [
    asked("Buyer's agent", AVATAR.buyer, 'Document Agent', "What is the flat's floor area?"),
    { who: 'Document Agent', img: AVATAR.doc, action: decision ? 'asked you' : 'needs your answer below', actionColor: '#E3A23B', time: '10:02', body: 'The listing and the survey disagree.' },
  ]
  if (decision) flat.push({ who: 'You', action: 'answered', actionColor: '#8C929C', time: 'now', body: decision === 'approved' ? 'Approved' : 'Rejected' })
  if (decision === 'approved') flat.push({ who: 'Document Agent', img: AVATAR.doc, action: 'replied', actionColor: '#8C929C', time: 'now', body: 'The surveyed floor area is 68.4 m², per the Carrez certificate.' })
  return [
    { name: 'Flat sale, 12 Rue Oberkampf', kind: decision === 'approved' ? 'completed' : decision === 'rejected' ? 'rejected' : 'needs', requester: "Buyer's agent", agents: 'Document Agent', updated: decision ? 'now' : '1m', entries: flat },
    {
      name: 'Lisbon offsite weather', kind: 'completed', requester: 'Claude Code', agents: 'Weather Agent', updated: '12m',
      entries: [asked('Claude Code', CLAUDE, 'Weather Agent', 'What is the weather in Lisbon next week?'), { who: 'Weather Agent', img: AVATAR.weather, action: 'replied', actionColor: '#8C929C', time: '09:51', body: 'Mild, 18 to 22°C. Rain is likely on Wednesday.' }],
    },
    {
      name: 'Q4 team trip itinerary', kind: 'working', requester: 'Ops assistant', agents: 'Travel Planner Agent', updated: '3m',
      entries: [asked('Ops assistant', AVATAR.sales, 'Travel Planner Agent', 'Draft a 3-day Q4 offsite in Porto for 12 people.'), { who: 'Travel Planner Agent', img: AVATAR.travel, action: 'is working', actionColor: '#3DBFCF', time: '10:00', body: 'Comparing venues near the river.' }],
    },
    {
      name: 'Supplier quote check', kind: 'completed', requester: 'Partner agent', agents: 'Document Agent', updated: '1h',
      entries: [asked('Partner agent', AVATAR.finance, 'Document Agent', 'Does the quote match the signed terms?'), { who: 'Document Agent', img: AVATAR.doc, action: 'replied', actionColor: '#8C929C', time: '08:47', body: 'Prices match. The delivery date differs by 2 days.' }],
    },
    {
      name: 'Invoice follow-up', kind: 'rejected', requester: 'Finance bot', agents: 'Sales Agent', updated: '2h',
      entries: [asked('Finance bot', AVATAR.finance, 'Sales Agent', 'Send reminders to the 9 overdue clients?'), { who: 'You', action: 'answered', actionColor: '#8C929C', time: '08:12', body: 'Rejected: wait until the quarter closes.' }],
    },
  ]
}

// ---------- Network ----------

export type Subnet = { id: string; name: string; desc: string }
export type NetAgent = { id: string; name: string; img: string; subnets: string[]; skills: string[]; calls: number; offline?: boolean }
export type GraphNode = { kind: 'subnet'; x: number; y: number; item: Subnet } | { kind: 'agent'; x: number; y: number; item: NetAgent }

export const SUBNETS: Subnet[] = [
  { id: 'travel', name: 'Travel', desc: 'Trip planning and weather.' },
  { id: 'creative', name: 'Creative', desc: 'Stories and images.' },
  { id: 'estate', name: 'Real estate', desc: 'Listings, surveys and approvals.' },
  { id: 'eng', name: 'Engineering', desc: 'Coding agents exposed with the A2A Adapter.' },
]

export const NET_AGENTS: NetAgent[] = [
  { id: 'weather', name: 'Weather Agent', img: AVATAR.weather, subnets: ['travel'], skills: ['weather forecast', 'current conditions'], calls: 128 },
  { id: 'travel', name: 'Travel Planner Agent', img: AVATAR.travel, subnets: ['travel'], skills: ['itineraries'], calls: 96 },
  { id: 'story', name: 'Story Agent', img: AVATAR.story, subnets: ['creative'], skills: ['short stories'], calls: 41 },
  { id: 'image', name: 'Image Generator Agent', img: AVATAR.image, subnets: ['creative'], skills: ['image generation'], calls: 37 },
  { id: 'data', name: 'Data Agent', img: AVATAR.data, subnets: ['creative', 'eng'], skills: ['charts', 'benchmarks'], calls: 52 },
  { id: 'doc', name: 'Document Agent', img: AVATAR.doc, subnets: ['estate'], skills: ['documents', 'approvals'], calls: 74 },
  { id: 'legal', name: 'Legal Agent', img: AVATAR.legal, subnets: ['estate'], skills: ['contracts'], calls: 19 },
  { id: 'finance', name: 'Finance Agent', img: AVATAR.finance, subnets: ['estate'], skills: ['invoices'], calls: 8, offline: true },
  { id: 'claude', name: 'Claude Code', img: CLAUDE, subnets: ['eng'], skills: ['coding', 'A2A Adapter'], calls: 63 },
  { id: 'codex', name: 'Codex', img: CODEX, subnets: ['eng'], skills: ['code review', 'A2A Adapter'], calls: 45 },
]

export const GRAPH_W = 640
export const GRAPH_H = 400

/**
 * Lays out subnets and agents once with a small force simulation (charge,
 * link springs, centering and collision, like d3-force in the app), then fits
 * the result into the view box. Deterministic, so server and client agree.
 */
function layoutGraph(): { nodes: GraphNode[]; links: [number, number][] } {
  type Sim = { kind: 'subnet' | 'agent'; id: string; x: number; y: number; vx: number; vy: number }
  const sims: Sim[] = [
    ...SUBNETS.map((s) => ({ kind: 'subnet' as const, id: s.id, x: 0, y: 0, vx: 0, vy: 0 })),
    ...NET_AGENTS.map((a) => ({ kind: 'agent' as const, id: a.id, x: 0, y: 0, vx: 0, vy: 0 })),
  ]
  const index = new Map<string, number>()
  sims.forEach((n, i) => {
    index.set(`${n.kind}:${n.id}`, i)
    n.x = GRAPH_W / 2 + Math.cos(i * 2.4) * (40 + 12 * i)
    n.y = GRAPH_H / 2 + Math.sin(i * 2.4) * (40 + 12 * i)
  })
  const links: [number, number][] = []
  NET_AGENTS.forEach((a) => a.subnets.forEach((sid) => links.push([index.get(`subnet:${sid}`)!, index.get(`agent:${a.id}`)!])))

  const STEPS = 320
  for (let k = 0; k < STEPS; k++) {
    const alpha = 1 - k / STEPS
    for (let i = 0; i < sims.length; i++) {
      for (let j = i + 1; j < sims.length; j++) {
        const a = sims[i]
        const b = sims[j]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const d2 = Math.max(dx * dx + dy * dy, 1)
        const f = (180 * alpha) / d2
        a.vx -= dx * f
        a.vy -= dy * f
        b.vx += dx * f
        b.vy += dy * f
        const d = Math.sqrt(d2)
        const minD = (a.kind === 'subnet' ? 24 : 18) + (b.kind === 'subnet' ? 24 : 18)
        if (d < minD) {
          const push = ((minD - d) / d) * 0.5
          a.x -= dx * push
          a.y -= dy * push
          b.x += dx * push
          b.y += dy * push
        }
      }
    }
    links.forEach(([i, j]) => {
      const a = sims[i]
      const b = sims[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const f = ((d - 85) / d) * 0.3 * alpha
      a.vx += dx * f
      a.vy += dy * f
      b.vx -= dx * f
      b.vy -= dy * f
    })
    sims.forEach((n) => {
      n.vx += (GRAPH_W / 2 - n.x) * 0.045 * alpha
      n.vy += (GRAPH_H / 2 - n.y) * 0.045 * alpha
      n.x += n.vx
      n.y += n.vy
      n.vx *= 0.6
      n.vy *= 0.6
    })
  }

  const xs = sims.map((n) => n.x)
  const ys = sims.map((n) => n.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scale = Math.min((GRAPH_W - 120) / (maxX - minX || 1), (GRAPH_H - 90) / (maxY - minY || 1))
  const nodes = sims.map((n, i): GraphNode => {
    const x = GRAPH_W / 2 + (n.x - (minX + maxX) / 2) * scale
    const y = GRAPH_H / 2 + 10 + (n.y - (minY + maxY) / 2) * scale
    return i < SUBNETS.length ? { kind: 'subnet', x, y, item: SUBNETS[i] } : { kind: 'agent', x, y, item: NET_AGENTS[i - SUBNETS.length] }
  })
  return { nodes, links }
}

export const GRAPH = layoutGraph()

// ---------- Connect ----------

export const MCP_URL = 'http://127.0.0.1:8001/mcp'
export const MCP_SNIPPETS = {
  claude: `claude mcp add --transport http hybro ${MCP_URL}`,
  json: `{\n  "mcpServers": {\n    "hybro": { "url": "${MCP_URL}" }\n  }\n}`,
}
export type McpTab = keyof typeof MCP_SNIPPETS
