'use client'

import { useRef, useState } from 'react'
import { InstallCard, type InstallOption } from '../install-card'
import { useTick } from '../use-tick'
import { Tui } from './tui'
import { WindowBar } from './window-bar'

type LineKind = 'cmd' | 'ok' | 'info' | 'text'

type Flow = {
  label: string
  prefix: string
  command: string
  copy: string
  shell: string
  lines: [LineKind, string][]
}

const AGENTIC_PROMPT = [
  'Install Hybro AI on my machine and get it running.',
  'Requires Docker (Compose v2.24+) and Node.js 18+.',
  '1. npm install -g @hybroai/cli',
  '2. hybro setup  (I will pick the provider and sign in)',
  '3. hybro start',
  '4. Check http://localhost:3000 and http://localhost:8000.',
  'If a container fails, show me hybro logs and fix it.',
]

const FLOWS = {
  npm: {
    label: 'NPM',
    prefix: '$ ',
    command: 'npm install -g @hybroai/cli',
    copy: 'npm install -g @hybroai/cli && hybro setup && hybro start',
    shell: 'macOS · Linux · WSL',
    lines: [
      ['cmd', 'npm install -g @hybroai/cli'], ['ok', 'added @hybroai/cli 0.2.18'],
      ['cmd', 'hybro setup'], ['ok', 'Connection  OpenAI / ChatGPT/Codex OAuth'], ['ok', 'Text model  gpt-5.5 verified'], ['ok', 'Saved ~/.hybro/config.json and auth.json'],
      ['cmd', 'hybro start'], ['ok', 'Pulled images for 0.2.18'],
      ['info', 'Hybro App    http://localhost:3000'], ['info', 'API Server   http://localhost:8000'], ['info', 'MCP Server   http://127.0.0.1:8001/mcp'],
    ],
  },
  curl: {
    label: 'CURL',
    prefix: '$ ',
    command: 'curl -fsSL https://raw.githubusercontent.com/hybroai/hybro/main/install.sh | sh',
    copy: 'curl -fsSL https://raw.githubusercontent.com/hybroai/hybro/main/install.sh | sh',
    shell: 'macOS · Linux',
    lines: [
      ['cmd', 'curl -fsSL https://raw.githubusercontent.com/hybroai/hybro/main/install.sh | sh'], ['ok', 'cloning hybroai/hybro into ~/hybro'], ['ok', 'opening the Hybro TUI'],
      ['cmd', './scripts/hybro setup'], ['ok', 'Connection  Anthropic / API key'], ['ok', 'Saved ~/.hybro/config.json and auth.json'],
      ['cmd', './scripts/hybro start --build'], ['ok', 'Built images from source'],
      ['info', 'Hybro App    http://localhost:3000'], ['info', 'API Server   http://localhost:8000'],
    ],
  },
  agentic: {
    label: 'AGENTIC',
    prefix: '',
    command: 'Paste a setup prompt into Claude Code, Codex or any coding agent',
    copy: AGENTIC_PROMPT.join('\n'),
    shell: 'Claude Code · Codex · any coding agent',
    lines: AGENTIC_PROMPT.map((text) => ['text', text]),
  },
} satisfies Record<string, Flow>

type FlowKey = keyof typeof FLOWS
const FLOW_KEYS = Object.keys(FLOWS) as FlowKey[]

const MARK: Record<LineKind, string> = { cmd: '$ ', ok: '✓ ', info: '→ ', text: '' }
const MARK_COLOR: Record<LineKind, string> = { cmd: '#B385F0', ok: '#4ADE80', info: '#3DBFCF', text: '#3DBFCF' }
const TEXT_COLOR: Record<LineKind, string> = { cmd: '#E3E6EB', text: '#E3E6EB', info: '#3DBFCF', ok: '#A8AEB8' }

// Typed lines appear a few characters per tick; output lines appear whole after a short delay.
function schedule(lines: Flow['lines']) {
  let cursor = 0
  const items = lines.map(([kind, text]) => {
    const start = cursor
    const typed = kind === 'cmd' || kind === 'text'
    const speed = kind === 'text' ? 3 : 2
    cursor += typed ? Math.ceil(text.length / speed) + 5 : 6
    return { kind, text, start, typed, speed }
  })
  return { items, end: cursor, cycle: cursor + 60 }
}

const OPTIONS: InstallOption[] = FLOW_KEYS.map((key) => {
  const flow: Flow = FLOWS[key]
  return {
    key,
    label: flow.label,
    shell: flow.shell,
    prompt: flow.prefix !== '',
    // The agentic tab shows the whole prompt it copies.
    body: key === 'agentic' ? flow.copy : flow.command,
    copy: flow.copy,
    copyLabel: key === 'agentic' ? 'Copy prompt' : undefined,
  }
})

const SCHEDULES = Object.fromEntries(FLOW_KEYS.map((k) => [k, schedule(FLOWS[k].lines)])) as Record<FlowKey, ReturnType<typeof schedule>>

export function Install() {
  const [tab, setTab] = useState<FlowKey>('npm')
  const [tabStart, setTabStart] = useState(0)
  const termRef = useRef<HTMLDivElement>(null)
  const sched = SCHEDULES[tab]
  const { t, reduced } = useTick(termRef, { staticTick: sched.end })
  const flow = FLOWS[tab]
  const blink = t % 12 < 6 ? 1 : 0

  const lt = reduced ? sched.end : (t - tabStart) % sched.cycle
  const shown = sched.items.filter((line) => lt >= line.start)

  const pick = (key: FlowKey) => {
    setTab(key)
    setTabStart(t)
  }

  return (
    <div id="install" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <InstallCard id="install" options={OPTIONS} value={tab} onChange={(key) => pick(key as FlowKey)} />

      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: 20, textAlign: 'left' }}>
        <figure ref={termRef} style={{ background: '#0A0B0E', border: '1px solid var(--line-strong)', borderRadius: 12, overflow: 'hidden' }}>
          <WindowBar title="Terminal" />
          <div className="mono" aria-label={`Terminal: ${flow.lines.map(([, text]) => text).join('. ')}`} role="img" style={{ height: 400, padding: '20px 22px', fontSize: 13, lineHeight: 1.9, overflow: 'hidden' }}>
            {shown.map((line, i) => {
              const count = line.typed ? Math.min(line.text.length, (lt - line.start) * line.speed) : line.text.length
              return (
                <div key={i} aria-hidden="true" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  <span style={{ color: MARK_COLOR[line.kind] }}>{MARK[line.kind]}</span>
                  <span style={{ color: TEXT_COLOR[line.kind] }}>{line.text.slice(0, count)}</span>
                  {i === shown.length - 1 && (
                    <span style={{ display: 'inline-block', width: 7, height: 15, verticalAlign: -3, background: '#3DBFCF', opacity: blink }} />
                  )}
                </div>
              )
            })}
          </div>
        </figure>
        <Tui />
      </div>
    </div>
  )
}
