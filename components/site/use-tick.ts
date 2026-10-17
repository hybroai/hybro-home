'use client'

import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )
}

/**
 * Animation clock for the home page demos. Counts ticks of `intervalMs` while
 * the element is on screen. With reduced motion it stops and returns
 * `staticTick`, a frame chosen to show the finished state.
 */
export function useTick(
  ref: RefObject<Element | null>,
  { intervalMs = 60, staticTick = 0 }: { intervalMs?: number; staticTick?: number } = {}
): { t: number; reduced: boolean } {
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [t, setT] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])

  useEffect(() => {
    if (reduced || !visible) return
    const id = window.setInterval(() => setT((x) => x + 1), intervalMs)
    return () => window.clearInterval(id)
  }, [reduced, visible, intervalMs])

  return { t: reduced ? staticTick : t, reduced }
}

/**
 * Runs `onFrame` on every display frame (60 Hz, 120 Hz, ...) while the element
 * is on screen, passing time in the same 60 ms tick units as useTick but as a
 * fractional value. Callers update the DOM directly, so React does not
 * re-render per frame. Stops entirely with reduced motion.
 */
export function useFrameLoop(ref: RefObject<Element | null>, onFrame: (t: number) => void, tickMs = 60) {
  const reduced = useReducedMotion()
  const callback = useRef(onFrame)
  useEffect(() => {
    callback.current = onFrame
  })

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let raf = 0
    let elapsed = 0
    let last = 0
    const loop = (now: number) => {
      if (last) elapsed += now - last
      last = now
      callback.current(elapsed / tickMs)
      raf = requestAnimationFrame(loop)
    }
    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf)
      last = 0
      if (entry.isIntersecting) raf = requestAnimationFrame(loop)
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [ref, reduced, tickMs])
}

/** Copies text and reports success for a short "Copied" label. */
export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = window.setTimeout(() => setCopied(false), resetMs)
    return () => window.clearTimeout(id)
  }, [copied, resetMs])

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return { copied, copy, reset: () => setCopied(false) }
}
