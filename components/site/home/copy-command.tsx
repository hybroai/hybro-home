'use client'

import { InstallCard } from '../install-card'
import { useCopy } from '../use-tick'

// Both install the same hybro command.
const INSTALL = [
  { key: 'curl', label: 'Shell script', command: 'curl -fsSL https://hybro.ai/install.sh | sh' },
  { key: 'npm', label: 'npm', command: 'npm install -g @hybroai/cli' },
]

/** The Hybro install command. With `start`, it adds the `hybro` line that starts it. */
export function InstallPanel({ id, start = false }: { id: string; start?: boolean }) {
  const options = INSTALL.map(({ key, label, command }) => ({ key, label, lines: start ? [command, 'hybro'] : [command] }))
  return <InstallCard id={id} options={options} large={!start} />
}

/** A card with shell commands, one per line, and a button that copies `copyText`. */
export function CommandCard({ title, text, lines, copyText }: { title: string; text?: string; lines: string[]; copyText: string }) {
  const { copied, copy } = useCopy()
  return (
    <div className="home-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h3 style={{ fontSize: 20, fontWeight: 500 }}>{title}</h3>
      {text && <p className="home-card-text" style={{ marginBottom: 12 }}>{text}</p>}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 10, border: '1px solid #24272E', background: '#0A0B0D' }}>
        <code className="mono" style={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.9, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {lines.map((line) => (
            <span key={line} style={{ display: 'block' }}>
              <span style={{ color: 'var(--cyan)' }}>$ </span>
              {line}
            </span>
          ))}
        </code>
        <button type="button" onClick={() => copy(copyText)} className="copy-btn copy-btn-accent" aria-label={`Copy the ${title.toLowerCase()} commands`}>
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}
