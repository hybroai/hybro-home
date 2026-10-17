'use client'

import { Fragment, useRef } from 'react'
import { useTick } from '../use-tick'
import { WindowBar } from './window-bar'

// Braille logo frames from the Hybro CLI (llm_gateway/tui_brand.py): [text, color] per row.
const FRAMES: [string, string][][] = [
  [['    ⢀⣠⠔⡦⣄⡀    ', '#33FFFF'], ['  ⣤⡚⠉ ⣀⣇ ⠉⢓⣤  ', '#34E6F9'], ['  ⡇⠈⢱⠮⣅⣯⠵⡎⠁⢸  ', '#36CDF3'], ['  ⡇⢀⡸⢖⡋⣟⡲⢇⡀⢸  ', '#37B4ED'], ['  ⠛⢥⣀ ⠉⡏ ⣀⡬⠛  ', '#399BE7'], ['    ⠈⠙⠢⠗⠋⠁    ', '#3A82E1']],
  [['     ⣠⠴⡦⣄     ', '#31F6F6'], ['  ⣤⡒⠉ ⣀⣇ ⠉⢒⣤  ', '#33DEF0'], ['  ⡇⠈⢱⠫⣅⣯⠝⡎⠁⢸  ', '#34C6EA'], ['  ⡇⢀⡸⣔⡋⣟⣢⢇⡀⢸  ', '#35AEE5'], ['  ⠛⠥⣀ ⠉⡏ ⣀⠬⠛  ', '#3796DF'], ['     ⠙⠲⠗⠋     ', '#387DD9']],
  [['     ⢀⡠⣄⡀     ', '#2DE0E0'], ['  ⢀⣴⠚⢁⡠⣇⡈⠓⣦⡀  ', '#2ECADB'], ['  ⢸⠈⢹⠣⣄⣧⠜⡏⠁⡇  ', '#2FB4D6'], ['  ⢸⢀⣸⡔⠋⡟⢢⣇⡀⡇  ', '#319ED1'], ['  ⠈⠻⢤⡈⠑⡏⢁⡤⠟⠁  ', '#3288CB'], ['     ⠈⠑⠋⠁     ', '#3372C6']],
  [['      ⢀⡀      ', '#29CBCB'], ['   ⡠⢔⣪⠕⡯⣕⡢⢄   ', '#2AB7C6'], ['   ⡏⡟⠢⣄⣧⠔⢻⢹   ', '#2BA3C1'], ['   ⣇⣧⠔⠋⡟⠢⣼⣸   ', '#2C8FBC'], ['   ⠑⠪⢝⡢⣗⡫⠕⠊   ', '#2D7BB8'], ['      ⠈⠁      ', '#2E67B3']],
  [['              ', '#27C2C2'], ['   ⢀⣠⠔⠊⡗⠢⣄⡀   ', '#28AFBD'], ['   ⢸⠑⠢⣄⣧⠔⠊⡇   ', '#299CB9'], ['   ⢸⡠⠔⠋⡟⠢⢄⡇   ', '#2A89B4'], ['   ⠈⠙⠢⢄⡧⠔⠋⠁   ', '#2B76B0'], ['              ', '#2C63AB']],
  [['      ⢀⡀      ', '#29CBCB'], ['   ⡠⢔⣪⠕⡯⣕⡢⢄   ', '#2AB7C6'], ['   ⡏⡟⠢⣄⣧⠔⢻⢹   ', '#2BA3C1'], ['   ⣇⣧⠔⠋⡟⠢⣼⣸   ', '#2C8FBC'], ['   ⠑⠪⢝⡢⣗⡫⠕⠊   ', '#2D7BB8'], ['      ⠈⠁      ', '#2E67B3']],
  [['     ⢀⡠⣄⡀     ', '#2DE0E0'], ['  ⢀⣴⠚⢁⡠⣇⡈⠓⣦⡀  ', '#2ECADB'], ['  ⢸⠈⢹⠣⣄⣧⠜⡏⠁⡇  ', '#2FB4D6'], ['  ⢸⢀⣸⡔⠋⡟⢢⣇⡀⡇  ', '#319ED1'], ['  ⠈⠻⢤⡈⠑⡏⢁⡤⠟⠁  ', '#3288CB'], ['     ⠈⠑⠋⠁     ', '#3372C6']],
  [['     ⣠⠴⡦⣄     ', '#31F6F6'], ['  ⣤⡒⠉ ⣀⣇ ⠉⢒⣤  ', '#33DEF0'], ['  ⡇⠈⢱⠫⣅⣯⠝⡎⠁⢸  ', '#34C6EA'], ['  ⡇⢀⡸⣔⡋⣟⣢⢇⡀⢸  ', '#35AEE5'], ['  ⠛⠥⣀ ⠉⡏ ⣀⠬⠛  ', '#3796DF'], ['     ⠙⠲⠗⠋     ', '#387DD9']],
]

type Option = { label: string; hint?: string }

const MODEL_OPTIONS: Option[] = [
  { label: 'Connection     OpenAI / ChatGPT/Codex OAuth' },
  { label: 'Text model     gpt-5.5' },
  { label: 'Verify and save', hint: 'Quota/billing applies. One text request; no auto-restart.' },
]

const SERVICE_OPTIONS: Option[] = [
  { label: 'Start services' },
  { label: 'Stop services' },
  { label: 'Reload configuration', hint: 'Reload saved configuration: recreate containers. Services will be interrupted.' },
  { label: 'View logs' },
  { label: 'MCP connection' },
  { label: 'Upgrade hybro', hint: 'Install the newest release. The stack version moves with the CLI.' },
]

const SERVICES = [['backend', 'frontend', 'mongo', 'redis', 'mcp'], ['weather-agent', 'travel-planner-agent', 'story-agent']]

const SELECTED = { background: '#33FFFF', color: '#0F111A', whiteSpace: 'pre-wrap' } as const
const PLAIN = { color: '#C9CDD4', whiteSpace: 'pre-wrap' } as const
const ACTIVE_TAB = { fontWeight: 700, textDecoration: 'underline', color: '#E3E6EB' } as const
const IDLE_TAB = { color: '#6E7480' } as const
const blank = <div style={{ height: '1.3em' }} />

// One 172-tick loop: walk the Models page, then the Services page.
function frame(t: number) {
  const tt = t % 172
  if (tt < 60) {
    const sel = tt < 20 ? 0 : tt < 40 ? 1 : 2
    return {
      page: 'models' as const,
      status: 'Saved locally',
      options: MODEL_OPTIONS,
      sel,
      notes: [MODEL_OPTIONS[sel].hint, 'Not checked: credentials or backend activation.', 'Image generation unavailable for this connection.'],
    }
  }
  const st = tt - 60
  const sel = st < 20 ? 0 : st < 34 ? 1 : st < 58 ? 2 : st < 72 ? 3 : st < 88 ? 4 : 5
  return {
    page: 'services' as const,
    status: '',
    options: SERVICE_OPTIONS,
    sel,
    notes: [SERVICE_OPTIONS[sel].hint, 'CLI and stack 0.2.18', 'More commands: hybro --help. Status refreshes on return.'],
  }
}

export function Tui() {
  const ref = useRef<HTMLElement>(null)
  const { t } = useTick(ref)
  const view = frame(t)
  const logo = FRAMES[Math.floor(t / 8) % FRAMES.length]

  return (
    <figure ref={ref} style={{ background: '#0F111A', border: '1px solid var(--line-strong)', borderRadius: 12, overflow: 'hidden' }}>
      <WindowBar title="~ hybro" />
      <div
        className="mono tui"
        role="img"
        aria-label="The hybro terminal UI: a Models page to pick the provider and model, and a Services page to start, stop and inspect the stack."
        style={{ height: 400, padding: '14px 10px', lineHeight: 1.3, display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}
      >
        <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
          {logo.map(([text, color], i) => <div key={i} style={{ whiteSpace: 'pre', color }}>{text}</div>)}
        </div>
        <div aria-hidden="true" style={{ width: '60ch', maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--text)' }}>
            <span>Hybro</span>
            <span>{view.status}</span>
          </div>
          <div style={{ whiteSpace: 'pre' }}>
            <span style={view.page === 'models' ? ACTIVE_TAB : IDLE_TAB}>Models</span>
            {'     '}
            <span style={view.page === 'services' ? ACTIVE_TAB : IDLE_TAB}>Services</span>
          </div>
          {blank}
          {view.page === 'services' && (
            <>
              {SERVICES.map((row, r) => (
                <div key={r} style={{ display: 'flex', flexWrap: 'wrap', columnGap: '3ch', color: '#C9CDD4' }}>
                  {row.map((name) => (
                    <span key={name} style={{ whiteSpace: 'pre' }}>
                      {name}: <span style={{ color: '#4ADE80' }}>active</span>
                    </span>
                  ))}
                </div>
              ))}
              {blank}
            </>
          )}
          {view.options.map((option, i) => (
            <Fragment key={option.label}>
              {option.hint && blank}
              <div style={i === view.sel ? SELECTED : PLAIN}>{(i === view.sel ? '> ' : '  ') + option.label}</div>
            </Fragment>
          ))}
          {blank}
          {view.notes.filter(Boolean).map((note) => <div key={note} style={{ color: '#6E7480' }}>{note}</div>)}
          {blank}
          <div style={{ color: '#6E7480', whiteSpace: 'pre-wrap' }}>Up/Down  Enter  Tab page  Esc back  Ctrl-C quit  Space pause</div>
        </div>
      </div>
    </figure>
  )
}
