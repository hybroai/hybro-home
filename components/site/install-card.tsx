'use client'

import { useRef } from 'react'
import { useCopy } from './use-tick'

export type InstallOption = {
  key: string
  label: string
  /** Where the method runs, shown on the right of the tab bar. */
  shell: string
  /** Text shown in the card; the shell prompt is added for commands. */
  body: string
  prompt: boolean
  /** Text copied to the clipboard. */
  copy: string
  copyLabel?: string
}

/** Install methods as tabs inside one card, with the command and a Copy button. */
export function InstallCard({
  id,
  options,
  value,
  onChange,
  maxWidth = 760,
  fontSize = 14,
}: {
  id: string
  options: InstallOption[]
  value: string
  onChange: (key: string) => void
  maxWidth?: number
  fontSize?: number
}) {
  const { copied, copy, reset } = useCopy()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const current = options.find((o) => o.key === value) ?? options[0]

  const pick = (key: string) => {
    onChange(key)
    reset()
  }
  const onTabKey = (e: React.KeyboardEvent, index: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (index + delta + options.length) % options.length
    pick(options[next].key)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="install-card" style={{ maxWidth }}>
      <div className="install-card-bar">
        <div role="tablist" aria-label="Install method" style={{ display: 'flex', gap: 4 }}>
          {options.map((option, i) => {
            const on = option.key === current.key
            return (
              <button
                key={option.key}
                ref={(el) => { tabRefs.current[i] = el }}
                type="button"
                role="tab"
                id={`${id}-tab-${option.key}`}
                aria-selected={on}
                aria-controls={`${id}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(option.key)}
                onKeyDown={(e) => onTabKey(e, i)}
                className="install-tab"
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--dim)' }}>{current.shell}</span>
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${current.key}`} className="install-card-body">
        <code className="mono" style={{ flex: 1, minWidth: 0, fontSize, lineHeight: 1.75, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          {current.prompt && <span style={{ color: 'var(--cyan)' }}>$ </span>}
          {current.body}
        </code>
        <button type="button" className="copy-btn copy-btn-accent" onClick={() => copy(current.copy)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
          <span aria-live="polite">{copied ? 'Copied' : current.copyLabel ?? 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}
