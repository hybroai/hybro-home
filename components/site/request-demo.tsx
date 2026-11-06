'use client'

import { type SubmitEvent, useEffect, useRef, useState } from 'react'
import { EMAIL_ERROR, HONEYPOT_FIELD, isValidEmail } from '../../lib/demo-request'

type Status = 'idle' | 'sending' | 'sent'

/** The header's "Request a demo" button and the form panel it opens. */
export function RequestDemo() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const sentHeading = useRef<HTMLHeadingElement>(null)
  // close() also runs from a listener added when the panel opened, so it reads status from a ref.
  const statusRef = useRef<Status>('idle')
  useEffect(() => {
    statusRef.current = status
    // The Submit button that had focus is gone; move focus to the thank-you heading so it is read out.
    if (status === 'sent') sentHeading.current?.focus()
  }, [status])

  const close = (returnFocus = true) => {
    // Stay open while sending, so the result is never shown to a closed panel.
    if (statusRef.current === 'sending') return
    setOpen(false)
    setError('')
    // After a sent request the next opening starts blank.
    if (statusRef.current === 'sent') {
      setStatus('idle')
      setEmail('')
      setMessage('')
    }
    if (returnFocus) button.current?.focus()
  }

  // Close on Escape, a click outside the panel, or focus moving out of it.
  useEffect(() => {
    if (!open) return
    emailInput.current?.focus()
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
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

  return (
    <div
      ref={root}
      className="demo"
      onKeyDown={(e) => e.key === 'Escape' && open && close()}
      onBlur={(e) => open && !root.current?.contains(e.relatedTarget as Node | null) && e.relatedTarget && close(false)}
    >
      <button
        ref={button}
        type="button"
        className="demo-btn"
        aria-expanded={open}
        aria-controls="demo-panel"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Request a demo"
      >
        <span className="demo-label-full">Request a demo</span>
        {/* Short label so a narrow header still fits the nav. */}
        <span className="demo-label-short">Demo</span>
      </button>
      {open && (
        <div id="demo-panel" role="dialog" aria-labelledby="demo-title" className="demo-panel">
          {status === 'sent' ? (
            <div className="demo-sent">
              <span aria-hidden="true" className="demo-check">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              <h2 id="demo-title" ref={sentHeading} tabIndex={-1} className="demo-title" style={{ outline: 'none' }}>Thanks, we got your request</h2>
              <p className="demo-text">
                We&apos;ll email you at <span style={{ color: 'var(--text)' }}>{email.trim()}</span> to set up a time.
              </p>
              <button type="button" className="demo-ghost" onClick={() => close()} style={{ marginTop: 4 }}>Close</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="demo-form">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 id="demo-title" className="demo-title">Request a demo</h2>
                <p className="demo-text">Leave your email and we&apos;ll reach out to set up a time.</p>
              </div>
              <label className="demo-field">
                Email
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
              {error && error !== EMAIL_ERROR && <p role="alert" className="demo-error">{error}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="demo-ghost" onClick={() => close()} disabled={status === 'sending'}>Cancel</button>
                <button type="submit" className="demo-btn demo-btn-lg" aria-disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
