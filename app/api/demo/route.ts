import { handleDemoRequest } from '../../../lib/demo-request'
import { createRateLimiter } from '../../../lib/rate-limit'

// A person sends one request, maybe a corrected second; more is a script.
const isRateLimited = createRateLimiter({ max: 5, windowMs: 10 * 60_000 })

export function POST(req: Request) {
  const { RESEND_API_KEY, DEMO_FROM_EMAIL, DEMO_TO_EMAIL } = process.env
  return handleDemoRequest(req, { env: { RESEND_API_KEY, DEMO_FROM_EMAIL, DEMO_TO_EMAIL }, isRateLimited, fetch, log: console.error })
}
