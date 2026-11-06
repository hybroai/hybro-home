import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildDemoEmail, handleDemoRequest, parseDemoRequest, sendDemoEmail } from '../lib/demo-request.ts'
import { createRateLimiter } from '../lib/rate-limit.ts'

describe('parseDemoRequest', () => {
  it('accepts an email and trims every field', () => {
    const result = parseDemoRequest({ email: '  alex@company.com ', message: '  Show me approvals.  ', page: '/a2a-adapter' })
    assert.deepEqual(result, { kind: 'ok', request: { email: 'alex@company.com', message: 'Show me approvals.', page: '/a2a-adapter' } })
  })

  it('treats the message and page as optional', () => {
    assert.deepEqual(parseDemoRequest({ email: 'alex@company.com' }), { kind: 'ok', request: { email: 'alex@company.com', message: '', page: '' } })
  })

  for (const email of ['', 'alex', 'alex@company', 'alex @company.com', 'alex@company.com\nBcc: x@y.z', 'a,b@company.com', '<a@company.com>', 'a@b;c.com', 'a@b..com', 'a@b.com.', 'a@.b.com', 'a@b.c\u0000m', 'a'.repeat(250) + '@x.io']) {
    it(`rejects the email ${JSON.stringify(email.slice(0, 30))}`, () => {
      assert.deepEqual(parseDemoRequest({ email }), { kind: 'invalid', error: 'Enter a valid email address.' })
    })
  }

  it('rejects a body that is not an object, or fields that are not strings', () => {
    assert.equal(parseDemoRequest(null).kind, 'invalid')
    assert.equal(parseDemoRequest('alex@company.com').kind, 'invalid')
    assert.equal(parseDemoRequest({ email: 42 }).kind, 'invalid')
    assert.equal(parseDemoRequest({ email: 'alex@company.com', message: ['x'] }).kind, 'invalid')
  })

  it('rejects a message over 2000 characters', () => {
    const result = parseDemoRequest({ email: 'alex@company.com', message: 'x'.repeat(2001) })
    assert.deepEqual(result, { kind: 'invalid', error: 'Keep the message under 2000 characters.' })
  })

  it('cuts a long page path instead of rejecting it', () => {
    const result = parseDemoRequest({ email: 'alex@company.com', page: '/' + 'p'.repeat(500) })
    assert.equal(result.kind, 'ok')
    assert.equal(result.request.page.length, 200)
  })

  it('drops a page that is not a site path', () => {
    for (const page of ['.evil.com/login', '//evil.com', 'https://evil.com', '/\nEmail: someone@else.com', '/a b', '/\u0007']) {
      assert.equal(parseDemoRequest({ email: 'alex@company.com', page }).request.page, '', page)
    }
  })

  it('flags a filled honeypot field as spam', () => {
    assert.deepEqual(parseDemoRequest({ email: 'alex@company.com', fax_only: 'http://spam.example' }), { kind: 'spam' })
  })
})

describe('buildDemoEmail', () => {
  it('addresses the team, replies to the requester and lists the details', () => {
    const email = buildDemoEmail(
      { email: 'alex@company.com', message: 'Show me approvals.', page: '/a2a-adapter' },
      { from: 'Hybro <demo@hybro.ai>', to: 'info@hybro.ai' },
    )
    assert.deepEqual(email, {
      from: 'Hybro <demo@hybro.ai>',
      to: ['info@hybro.ai'],
      reply_to: 'alex@company.com',
      subject: 'Demo request from alex@company.com',
      text: 'Email: alex@company.com\nMessage: Show me approvals.\nPage: hybro.ai/a2a-adapter',
    })
  })

  it('says when no message or page was given', () => {
    const email = buildDemoEmail({ email: 'alex@company.com', message: '', page: '' }, { from: 'f@hybro.ai', to: 'info@hybro.ai' })
    assert.equal(email.text, 'Email: alex@company.com\nMessage: (none)\nPage: (unknown)')
  })
})

describe('sendDemoEmail', () => {
  const email = { from: 'f@hybro.ai', to: ['info@hybro.ai'], reply_to: 'alex@company.com', subject: 's', text: 't' }

  it('posts the email to the Resend API with the key', async () => {
    const calls = []
    const fetch = async (url, init) => {
      calls.push({ url, init })
      return new Response(JSON.stringify({ id: 'abc' }), { status: 200 })
    }
    await sendDemoEmail(email, { apiKey: 're_test', fetch })
    assert.equal(calls.length, 1)
    assert.ok(calls[0].init.signal instanceof AbortSignal, 'the request has a timeout signal')
    assert.equal(calls[0].url, 'https://api.resend.com/emails')
    assert.equal(calls[0].init.method, 'POST')
    assert.equal(calls[0].init.headers.Authorization, 'Bearer re_test')
    assert.equal(calls[0].init.headers['Content-Type'], 'application/json')
    assert.deepEqual(JSON.parse(calls[0].init.body), email)
  })

  it('throws with the status when Resend refuses the email', async () => {
    const fetch = async () => new Response('{"message":"domain not verified"}', { status: 403 })
    await assert.rejects(sendDemoEmail(email, { apiKey: 're_test', fetch }), /Resend responded 403/)
  })

  it('gives up when Resend does not answer within the timeout', async () => {
    const fetch = (_url, init) =>
      new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason)))
    await assert.rejects(sendDemoEmail(email, { apiKey: 're_test', fetch, timeoutMs: 20 }), { name: 'TimeoutError' })
  })
})

describe('handleDemoRequest', () => {
  const ORIGIN = 'https://hybro.ai'
  const post = (body, headers = {}) =>
    new Request('https://hybro.ai/api/demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN, 'x-forwarded-for': '203.0.113.7', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  const setup = ({ env = { RESEND_API_KEY: 're_test' }, limited = false, status = 200 } = {}) => {
    const sent = []
    const keys = []
    const deps = {
      env,
      isRateLimited: (key) => {
        keys.push(key)
        return limited
      },
      fetch: async (_url, init) => {
        sent.push(JSON.parse(init.body))
        return new Response('{}', { status })
      },
      log: () => {},
    }
    return { sent, keys, run: (req) => handleDemoRequest(req, deps) }
  }
  const call = async (run, req) => {
    const res = await run(req)
    return { status: res.status, body: await res.json() }
  }

  it('sends the email with the default addresses and answers ok', async () => {
    const { sent, run } = setup()
    assert.deepEqual(await call(run, post({ email: 'alex@company.com', message: 'Hi', page: '/' })), { status: 200, body: { ok: true } })
    assert.equal(sent.length, 1)
    assert.equal(sent[0].from, 'Hybro <demo@hybro.ai>')
    assert.deepEqual(sent[0].to, ['info@hybro.ai'])
    assert.equal(sent[0].reply_to, 'alex@company.com')
  })

  it('uses DEMO_FROM_EMAIL and DEMO_TO_EMAIL when set', async () => {
    const { sent, run } = setup({ env: { RESEND_API_KEY: 're_test', DEMO_FROM_EMAIL: 'Demo <d@hybro.ai>', DEMO_TO_EMAIL: 'sales@hybro.ai' } })
    await run(post({ email: 'alex@company.com' }))
    assert.equal(sent[0].from, 'Demo <d@hybro.ai>')
    assert.deepEqual(sent[0].to, ['sales@hybro.ai'])
  })

  it('refuses a missing or foreign Origin', async () => {
    const { sent, run } = setup()
    assert.deepEqual(await call(run, post({ email: 'alex@company.com' }, { Origin: 'https://evil.example' })), { status: 403, body: { error: 'This form only works on hybro.ai.' } })
    const noOrigin = new Request('https://hybro.ai/api/demo', { method: 'POST', body: '{"email":"alex@company.com"}' })
    assert.equal((await run(noOrigin)).status, 403)
    assert.equal(sent.length, 0)
  })

  it('keys the limit on the first x-forwarded-for address, then x-real-ip', async () => {
    const { keys, run } = setup()
    await run(post({ email: 'alex@company.com' }, { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))
    await run(post({ email: 'alex@company.com' }, { 'x-forwarded-for': '', 'x-real-ip': '198.51.100.2' }))
    assert.deepEqual(keys, ['203.0.113.7', '198.51.100.2'])
  })

  it('refuses a declared Content-Length over 8 KB before reading the body', async () => {
    const { sent, run } = setup()
    const req = post({ email: 'alex@company.com' }, { 'Content-Length': '100000' })
    assert.equal((await run(req)).status, 413)
    assert.equal(req.bodyUsed, false)
    assert.equal(sent.length, 0)
  })

  it('answers 429 when the client is over the limit', async () => {
    const { sent, run } = setup({ limited: true })
    assert.equal((await run(post({ email: 'alex@company.com' }))).status, 429)
    assert.equal(sent.length, 0)
  })

  it('answers 400 for a body that is not JSON, an invalid email, or one that is too large', async () => {
    const { sent, run } = setup()
    assert.equal((await run(post('not json'))).status, 400)
    assert.deepEqual(await call(run, post({ email: 'nope' })), { status: 400, body: { error: 'Enter a valid email address.' } })
    assert.equal((await run(post({ email: 'alex@company.com', message: 'x'.repeat(9000) }))).status, 413)
    assert.equal(sent.length, 0)
  })

  it('answers spam as if it worked, without sending', async () => {
    const { sent, run } = setup()
    assert.deepEqual(await call(run, post({ email: 'alex@company.com', fax_only: 'x' })), { status: 200, body: { ok: true } })
    assert.equal(sent.length, 0)
  })

  it('answers 503 when RESEND_API_KEY is not set', async () => {
    const { sent, run } = setup({ env: {} })
    assert.equal((await run(post({ email: 'alex@company.com' }))).status, 503)
    assert.equal(sent.length, 0)
  })

  it('answers 502 when Resend refuses the email', async () => {
    const { run } = setup({ status: 500 })
    assert.equal((await run(post({ email: 'alex@company.com' }))).status, 502)
  })
})

describe('createRateLimiter', () => {
  it('allows up to the limit per key within the window, then blocks', () => {
    let now = 0
    const limited = createRateLimiter({ max: 2, windowMs: 1000, now: () => now })
    assert.equal(limited('a'), false)
    assert.equal(limited('a'), false)
    assert.equal(limited('a'), true)
    assert.equal(limited('b'), false)
    now = 1000
    assert.equal(limited('a'), false)
  })

  it('forgets idle clients once it tracks more than maxKeys', () => {
    let now = 0
    const limited = createRateLimiter({ max: 1, windowMs: 1000, maxKeys: 1, now: () => now })
    limited('a')
    limited('b')
    now = 1000
    // 'a' and 'b' are idle now, so tracking 'c' prunes them and 'a' starts fresh.
    assert.equal(limited('c'), false)
    assert.equal(limited('a'), false)
    assert.equal(limited('a'), true)
  })

  it('evicts the oldest clients when more than maxKeys are active at once', () => {
    const limited = createRateLimiter({ max: 1, windowMs: 1000, maxKeys: 2, now: () => 0 })
    limited('a')
    limited('b')
    limited('c')
    limited('d')
    // 'a' was evicted, so it is not limited; 'd' is still tracked.
    assert.equal(limited('a'), false)
    assert.equal(limited('d'), true)
  })
})
