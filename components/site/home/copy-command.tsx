'use client'

import { useCopy } from '../use-tick'

/** The hero's one-line install command; the whole button copies it. */
export function HeroCopy({ command }: { command: string }) {
  const { copied, copy } = useCopy()
  return (
    <button type="button" onClick={() => copy(command)} className="hero-copy" aria-label={`Copy: ${command}`}>
      <span className="mono" style={{ fontSize: 14 }}>
        <span style={{ color: 'var(--cyan)' }}>$ </span>
        {command}
      </span>
      <span aria-live="polite" style={{ fontSize: 12.5, color: 'var(--faint)' }}>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
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
