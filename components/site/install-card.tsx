'use client'

import { useRef, useState } from 'react'
import { useCopy } from './use-tick'

export type InstallOption = {
  key: string
  label: string
  /** Commands shown in the card, one per line, each with a shell prompt. */
  lines: string[]
}

/**
 * Install methods as a segmented switch inside one card, with the commands and
 * a Copy button that copies them joined with `&&`. `large` is the hero size.
 */
export function InstallCard({ id, options, large = false }: { id: string; options: InstallOption[]; large?: boolean }) {
  const [index, setIndex] = useState(0)
  const { copied, copy, reset } = useCopy()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const current = options[index]

  const pick = (next: number) => {
    setIndex(next)
    reset()
  }
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (i + delta + options.length) % options.length
    pick(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className={`install-card${large ? ' install-card-lg' : ''}`}>
      <div className="install-card-bar">
        <div className="install-seg" role="tablist" aria-label="Install method">
          {options.map((option, i) => {
            const on = i === index
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
                onClick={() => pick(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className="install-tab"
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${current.key}`} className="install-card-body">
        <code className="mono">
          {current.lines.map((line) => (
            <span key={line} style={{ display: 'block' }}>
              <span style={{ color: 'var(--cyan)' }}>$ </span>
              {line}
            </span>
          ))}
        </code>
        <button type="button" className="copy-btn copy-btn-accent" onClick={() => copy(current.lines.join(' && '))} aria-label="Copy the install command">
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}
