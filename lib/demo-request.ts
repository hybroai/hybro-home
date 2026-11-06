// "Request a demo" form: validates what the site header's form posts and
// emails it to the team through Resend. Shared by the API route and the form.

export type DemoRequest = { email: string; message: string; page: string }

export type ParsedDemoRequest =
  | { kind: 'ok'; request: DemoRequest }
  | { kind: 'invalid'; error: string }
  // The hidden honeypot field was filled in, so a bot sent it.
  | { kind: 'spam' }

export const EMAIL_ERROR = 'Enter a valid email address.'
/** Name of the hidden field people never see; a value in it marks a bot. */
export const HONEYPOT_FIELD = 'fax_only'
const MESSAGE_ERROR = 'Keep the message under 2000 characters.'
const MAX_EMAIL = 254
const MAX_MESSAGE = 2000
const MAX_PAGE = 200
const MAX_BODY_BYTES = 8 * 1024
const RESEND_TIMEOUT_MS = 10_000
// One address: no whitespace or control characters (so no added mail
// headers), none of the characters that would make it a list or a display
// name, and a domain of dot-separated labels.
const EMAIL_PATTERN = /^[^\s\x00-\x1f@<>,;"()]+@[^\s\x00-\x1f@<>,;"().]+(\.[^\s\x00-\x1f@<>,;"().]+)+$/

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL && EMAIL_PATTERN.test(email)
}

const optionalString = (value: unknown): string | null => (value === undefined ? '' : typeof value === 'string' ? value.trim() : null)

export function parseDemoRequest(body: unknown): ParsedDemoRequest {
  if (typeof body !== 'object' || body === null) return { kind: 'invalid', error: EMAIL_ERROR }
  const fields = body as Record<string, unknown>
  const trap = fields[HONEYPOT_FIELD]
  if (typeof trap === 'string' && trap.trim()) return { kind: 'spam' }

  const email = typeof fields.email === 'string' ? fields.email.trim() : ''
  if (!isValidEmail(email)) return { kind: 'invalid', error: EMAIL_ERROR }
  const message = optionalString(fields.message)
  const page = optionalString(fields.page)
  if (message === null || page === null) return { kind: 'invalid', error: EMAIL_ERROR }
  if (message.length > MAX_MESSAGE) return { kind: 'invalid', error: MESSAGE_ERROR }
  // Only a path on this site, so the email never shows a link to somewhere
  // else, and on one line, so it cannot add made-up lines to the email.
  const sitePath = page.startsWith('/') && !page.startsWith('//') && !/[\s\x00-\x1f]/.test(page) ? page.slice(0, MAX_PAGE) : ''
  return { kind: 'ok', request: { email, message, page: sitePath } }
}

/** The body of a Resend send-email request. */
export type DemoEmail = { from: string; to: string[]; reply_to: string; subject: string; text: string }

export function buildDemoEmail(request: DemoRequest, { from, to }: { from: string; to: string }): DemoEmail {
  return {
    from,
    to: [to],
    // Replying to the notification answers the person who asked.
    reply_to: request.email,
    subject: `Demo request from ${request.email}`,
    text: [
      `Email: ${request.email}`,
      `Message: ${request.message || '(none)'}`,
      `Page: ${request.page ? `hybro.ai${request.page}` : '(unknown)'}`,
    ].join('\n'),
  }
}

export async function sendDemoEmail(
  email: DemoEmail,
  { apiKey, fetch, timeoutMs = RESEND_TIMEOUT_MS }: { apiKey: string; fetch: typeof globalThis.fetch; timeoutMs?: number },
): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
    // A hung Resend call becomes a clear failure instead of a stuck form.
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) throw new Error(`Resend responded ${response.status}: ${await response.text()}`)
}

// Hosts the "Request a demo" form is served from.
const ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'hybro.ai', 'www.hybro.ai', 'docs.hybro.ai', 'hybro-documents.vercel.app']

function isAllowedOrigin(origin: string | null): boolean {
  // Browsers always send Origin on a fetch POST; a request without one is not from the form.
  if (!origin) return false
  try {
    return ALLOWED_HOSTS.includes(new URL(origin).hostname)
  } catch {
    return false
  }
}

export type DemoRequestDeps = {
  env: { RESEND_API_KEY?: string; DEMO_FROM_EMAIL?: string; DEMO_TO_EMAIL?: string }
  isRateLimited: (key: string) => boolean
  fetch: typeof globalThis.fetch
  log: (...args: unknown[]) => void
}

const json = (status: number, body: Record<string, unknown>) => Response.json(body, { status })

/** The POST /api/demo handler, with its environment and I/O passed in. */
export async function handleDemoRequest(req: Request, { env, isRateLimited, fetch, log }: DemoRequestDeps): Promise<Response> {
  if (!isAllowedOrigin(req.headers.get('origin'))) return json(403, { error: 'This form only works on hybro.ai.' })

  // Vercel sets x-forwarded-for to the client's address.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  if (isRateLimited(ip)) return json(429, { error: 'Too many requests. Please try again in a few minutes.' })

  // Refuse a large body before reading it; the length check below covers a missing or false header.
  if (Number(req.headers.get('content-length')) > MAX_BODY_BYTES) return json(413, { error: 'That request is too large.' })
  const raw = await req.text()
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return json(413, { error: 'That request is too large.' })
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { error: 'Invalid request.' })
  }
  const parsed = parseDemoRequest(body)
  if (parsed.kind === 'spam') {
    // Answer bots as if it worked, so they learn nothing; the log shows any real person caught by mistake.
    log('Demo request dropped as spam')
    return json(200, { ok: true })
  }
  if (parsed.kind === 'invalid') return json(400, { error: parsed.error })

  if (!env.RESEND_API_KEY) {
    log('Demo request not sent: RESEND_API_KEY is not set')
    return json(503, { error: 'Demo requests are not available right now. Email info@hybro.ai instead.' })
  }
  const email = buildDemoEmail(parsed.request, {
    from: env.DEMO_FROM_EMAIL || 'Hybro <demo@hybro.ai>',
    to: env.DEMO_TO_EMAIL || 'info@hybro.ai',
  })
  try {
    await sendDemoEmail(email, { apiKey: env.RESEND_API_KEY, fetch })
  } catch (error) {
    log('Demo request not sent:', error)
    return json(502, { error: 'Something went wrong sending your request. Please try again, or email info@hybro.ai.' })
  }
  return json(200, { ok: true })
}
