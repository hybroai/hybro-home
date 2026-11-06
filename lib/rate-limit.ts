/**
 * In-memory sliding-window limiter keyed by client (an IP). It
 * lives in one server instance, so it slows a single client down rather than
 * enforcing a global cap. Returns a function that records a request and says
 * whether it is over the limit.
 */
export function createRateLimiter({ max, windowMs, maxKeys = 10_000, now = Date.now }: { max: number; windowMs: number; maxKeys?: number; now?: () => number }) {
  const requests = new Map<string, number[]>()

  return function isLimited(key: string): boolean {
    const time = now()
    // Keep the map bounded: drop clients with no recent requests, then the
    // oldest-tracked ones (a Map iterates in insertion order) if still too many.
    if (requests.size > maxKeys) {
      for (const [k, stamps] of requests) {
        if (stamps.every((t) => time - t >= windowMs)) requests.delete(k)
      }
      for (const k of requests.keys()) {
        if (requests.size <= maxKeys) break
        requests.delete(k)
      }
    }
    const recent = (requests.get(key) ?? []).filter((t) => time - t < windowMs)
    const limited = recent.length >= max
    if (!limited) recent.push(time)
    requests.set(key, recent)
    return limited
  }
}
