'use client'

import { type SubmitEvent, useEffect, useEffectEvent, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { EMAIL_ERROR, HONEYPOT_FIELD, isValidEmail } from '../../lib/demo-request'

type Status = 'idle' | 'sending' | 'sent'

const POINTS = ['Connect any agent', 'Multi-agent collaboration across platforms', 'Humans in charge of agent group collaboration']

const FOCUSABLE = 'button:not([disabled]), input:not([tabindex="-1"]), textarea, [href]'

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function Check({ size, stroke }: { size: number; stroke: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/** The header's "Request a demo" button and the dialog it opens in the middle of the page. */
export function RequestDemo() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  // Where the dialog renders, found when it opens (see the note at the portal).
  const [portalTarget, setPortalTarget] = useState<Element | null>(null)
  const button = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const sentHeading = useRef<HTMLHeadingElement>(null)
  // Whether the current press started, and then ended, on the dimmed page around the dialog.
  const pressedBackdrop = useRef(false)
  const releasedBackdrop = useRef(false)

  // The Submit button that had focus is gone; move focus to the thank-you heading so it is read out.
  useEffect(() => {
    if (status === 'sent') sentHeading.current?.focus()
  }, [status])


  const close = () => {
    // Stay open while sending, so the result is never shown to a closed dialog.
    if (status === 'sending') return
    setOpen(false)
    setError('')
    // After a sent request the next opening starts blank.
    if (status === 'sent') {
      setStatus('idle')
      setEmail('')
      setMessage('')
    }
    button.current?.focus()
  }

  // Escape closes; Tab and Shift+Tab cycle inside the dialog, as it is modal. On the
  // document, so it still works after a click lands focus outside the dialog.
  const onKeyDown = useEffectEvent((e: globalThis.KeyboardEvent) => {
    // Escape while an input method is composing cancels the composition, not the dialog.
    if (e.isComposing) return
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key !== 'Tab' || !dialog.current) return
    const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    // Focus on the dialog box itself (after a click on its text) counts as outside the tab order.
    const inside = active !== dialog.current && dialog.current.contains(active)
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault()
      first.focus()
    }
  })

  // While open: focus the email field, handle keys, and keep the page behind from
  // scrolling, padding for the scrollbar that goes away so the page does not shift.
  useEffect(() => {
    if (!open) return
    emailInput.current?.focus()
    const keydown = (e: globalThis.KeyboardEvent) => onKeyDown(e)
    document.addEventListener('keydown', keydown)
    const html = document.documentElement
    const { overflow, paddingRight } = html.style
    const scrollbar = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    if (scrollbar > 0) html.style.paddingRight = `${scrollbar}px`
    return () => {
      document.removeEventListener('keydown', keydown)
      html.style.overflow = overflow
      html.style.paddingRight = paddingRight
    }
  }, [open])

  const submit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!isValidEmail(email.trim())) {
      setError(EMAIL_ERROR)
      emailInput.current?.focus()
      return
    }
    const trap = (new FormData(e.currentTarget).get(HONEYPOT_FIELD) as string | null) ?? ''
    setStatus('sending')
    setError('')
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message, page: window.location.pathname, [HONEYPOT_FIELD]: trap }),
      })
      if (res.ok) {
        setStatus('sent')
        return
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      setError(data?.error ?? 'Something went wrong sending your request. Please try again.')
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    }
    setStatus('idle')
  }

  const sent = status === 'sent'
  const content = (
    <div
      className="demo-backdrop"
      // A press that starts and ends on the dimmed page closes; one that starts or ends
      // inside the dialog (selecting text, say) does not.
      onPointerDown={(e) => {
        pressedBackdrop.current = e.target === e.currentTarget
        releasedBackdrop.current = false
      }}
      onPointerUp={(e) => {
        releasedBackdrop.current = e.target === e.currentTarget
      }}
      // Close on the click, not the pointerup, so the backdrop takes the whole tap and
      // nothing behind it is clicked once it is gone.
      onClick={(e) => {
        const onBackdrop = pressedBackdrop.current && releasedBackdrop.current
        pressedBackdrop.current = false
        releasedBackdrop.current = false
        if (onBackdrop && e.target === e.currentTarget) close()
      }}
    >
      <div
        ref={dialog}
        id="demo-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        // Focusable, so a click on its text keeps focus inside the dialog.
        tabIndex={-1}
        className={sent ? 'demo-dialog demo-dialog-sent' : 'demo-dialog'}
      >
        <button type="button" className="demo-close" aria-label="Close" onClick={close}>
          <CloseIcon />
        </button>
        {/* Scrolls on short screens; the close button stays put outside it. */}
        <div className="demo-body">
          {sent ? (
            <div className="demo-sent">
              <span aria-hidden="true" className="demo-check">
                <Check size={22} stroke={2.4} />
              </span>
              <h2 id="demo-title" ref={sentHeading} tabIndex={-1} className="demo-title" style={{ outline: 'none' }}>Thanks, we got your request</h2>
              <p className="demo-text">
                We&apos;ll email <span style={{ color: 'var(--text)' }}>{email.trim()}</span> to set a time.
              </p>
              <button type="button" className="demo-ghost" onClick={close} style={{ marginTop: 6 }}>Done</button>
            </div>
          ) : (
            <>
              <div className="demo-aside">
                <span className="mono demo-eyebrow">Request a demo</span>
                <h2 id="demo-title" className="demo-title">See Hybro in action</h2>
                <ul className="demo-list">
                  {POINTS.map((point) => (
                    <li key={point}>
                      <span className="demo-tick" aria-hidden="true">
                        <Check size={10} stroke={3.2} />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="demo-meta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <span>30 min, online</span>
                </div>
              </div>
              <form onSubmit={submit} noValidate className="demo-form">
                <label className="demo-field">
                  Work email
                  <input
                    ref={emailInput}
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    aria-invalid={error === EMAIL_ERROR || undefined}
                    aria-describedby={error === EMAIL_ERROR ? 'demo-error' : undefined}
                  />
                </label>
                {error === EMAIL_ERROR && <p id="demo-error" role="alert" className="demo-error">{error}</p>}
                <label className="demo-field">
                  <span>Message <span style={{ color: 'var(--faint)' }}>(optional)</span></span>
                  <textarea name="message" rows={4} maxLength={2000} placeholder="What would you like to see?" value={message} onChange={(e) => setMessage(e.target.value)} />
                </label>
                {/* Hidden from people; bots that fill every field get dropped. */}
                <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" aria-hidden="true" className="demo-trap" />
                {error && error !== EMAIL_ERROR && <p role="alert" className="demo-error" style={{ marginTop: 0 }}>{error}</p>}
                <button type="submit" className="demo-btn demo-submit" aria-disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Request demo'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        ref={button}
        type="button"
        className="demo-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? 'demo-dialog' : undefined}
        onClick={() => {
          // The header's backdrop-filter would make it the box a fixed overlay sits in,
          // so the dialog renders at the end of the page wrapper instead.
          setPortalTarget(button.current?.closest('.site') ?? document.body)
          setOpen(true)
        }}
        aria-label="Request a demo"
      >
        <span className="demo-label-full">Request a demo</span>
        {/* Short label so a narrow header still fits the nav. */}
        <span className="demo-label-short">Demo</span>
      </button>
      {open && portalTarget && createPortal(content, portalTarget)}
    </>
  )
}
