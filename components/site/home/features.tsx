'use client'

import { type CSSProperties, useEffect, useRef } from 'react'
import { AVATAR } from '../avatars'
import { Avatar } from '../chrome'
import { HybroWordmark } from '../icons'
import { Mention } from '../mention'
import { useTick } from '../use-tick'
import { AtIcon, ChevronIcon, GlobeIcon, PaperclipIcon, SendIcon, SparkIcon } from './composer'

const chevron = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
)
const circle = (size: number, extra: CSSProperties): CSSProperties => ({ width: size, height: size, borderRadius: '50%', flexShrink: 0, ...extra })

/* ── Rooms: two agents work on one message, then the answer streams in ── */

const ROOM_PROMPT = "Plan a 7-day trip to Oahu for four people, and check Honolulu's weather for the week"
const ROOM_ANSWER = 'Here is your 7-day Oahu plan.\nWeather: sunny, light trade winds, 27 to 29°C; a passing shower on Thursday, so the North Shore day moves to Wednesday.\nDay 1: Waikiki and Diamond Head at sunrise.\nDay 2: Pearl Harbor and downtown Honolulu.\nDay 3: North Shore beaches and shrimp trucks.'
const ROOM_START = 10
const ROOM_AGENTS = [
  { name: 'Weather Agent', img: AVATAR.weather, start: ROOM_START + 8, end: ROOM_START + 46, task: "Honolulu's forecast for the next 7 days" },
  { name: 'Travel Planner Agent', img: AVATAR.travel, start: ROOM_START + 14, end: ROOM_START + 72, task: '7-day Oahu itinerary for four people' },
]
const ANSWER_START = ROOM_START + 76
const ANSWER_TICKS = Math.ceil(ROOM_ANSWER.length / 3)

export function RoomDemo() {
  const ref = useRef<HTMLElement>(null)
  const { t } = useTick(ref, { staticTick: 249 })
  const at = t % 250
  const blink = t % 12 < 6 ? 1 : 0
  const inRoom = at >= ROOM_START
  const agents = ROOM_AGENTS.filter((g) => at >= g.start).map((g) => ({ ...g, working: at < g.end }))
  const done = agents.filter((g) => !g.working).length
  const finished = at >= ANSWER_START + ANSWER_TICKS
  const elapsed = (Math.max(0, Math.min(at, ANSWER_START + ANSWER_TICKS) - ROOM_START) * 0.06).toFixed(1)
  const messages = useRef<HTMLDivElement>(null)

  // Keep the newest content in view, like the real chat, as the answer streams in.
  useEffect(() => {
    const el = messages.current
    if (el) el.scrollTop = el.scrollHeight
  }, [at])

  return (
    <figure ref={ref} className="mock" role="img" aria-label="A Hybro room: one message to the Weather Agent and the Travel Planner Agent, both run, and Hybro combines their answers into one 7-day Oahu plan.">
      <div aria-hidden="true" style={{ height: 580, display: 'flex', flexDirection: 'column', fontSize: 13 }}>
        <div ref={messages} style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!inRoom ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <HybroWordmark size={24} />
              <span style={{ color: 'var(--faint)' }}>What would you like to work on today?</span>
            </div>
          ) : (
            <>
              <div style={{ alignSelf: 'stretch', background: '#1E2127', border: '1px solid var(--line-strong)', borderRadius: 12, padding: '10px 14px' }}>
                <Mention name="Weather Agent" img={AVATAR.weather} />{' '}
                <Mention name="Travel Planner Agent" img={AVATAR.travel} />{' '}
                {ROOM_PROMPT}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}>
                <span style={circle(8, { background: finished ? '#4ADE80' : '#3DBFCF' })} />
                <span style={{ color: 'var(--text)' }}>{finished ? 'Finished' : 'Running'}</span>
                <span className="mono" style={{ color: 'var(--dim)' }}>{elapsed}s</span>
                {chevron}
              </div>
              {at >= ROOM_START + 20 && at < ANSWER_START && (
                <div className="shimmer" style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px' }}>Synthesizing responses…</div>
              )}
              {at >= ANSWER_START && (
                <div style={{ lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {ROOM_ANSWER.slice(0, Math.max(0, (at - ANSWER_START) * 3))}
                  <span style={{ display: 'inline-block', width: 7, height: 14, marginLeft: 2, verticalAlign: -2, background: '#3DBFCF', opacity: finished ? 0 : blink }} />
                </div>
              )}
              <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '7px 12px', fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {chevron}Agent responses · 2 calls · {done} done · {agents.length - done} working
                </div>
                {agents.map((g) => (
                  <div key={g.name} style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px', borderTop: '1px solid #1C1F25' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ position: 'relative', width: 24, height: 24, flexShrink: 0 }}>
                        <Avatar src={g.img} size={24} radius={12} />
                        {/* Matches .conversation-avatar-working in the Hybro app. */}
                        {g.working && (
                          <span className="spin-slow" style={{ position: 'absolute', inset: -3, borderRadius: 15, border: '2px solid transparent', borderTopColor: '#3DBFCF' }} />
                        )}
                      </span>
                      <span style={{ flex: 1, fontWeight: 500 }}>{g.name}</span>
                      <span style={{ fontSize: 12, color: g.working ? '#3DBFCF' : '#4ADE80' }}>{g.working ? 'Running' : 'Completed'}</span>
                    </div>
                    <div style={{ paddingLeft: 34, fontSize: 12, color: 'var(--dim)' }}>└ {g.task}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ padding: '10px 14px 14px' }}>
          <div style={{ background: '#1A1D23', border: '1px solid var(--line-strong)', borderRadius: 10, padding: '10px 12px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ color: '#5A606B' }}>Type a message... Use @ to mention agents</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, color: 'var(--muted)', fontSize: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><GlobeIcon size={13} />All agents</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><SparkIcon size={13} />Ultimate<ChevronIcon size={11} /></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <PaperclipIcon size={15} />
                <AtIcon size={15} />
                <span style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', background: 'rgba(61,191,207,0.4)' }}>
                  <SendIcon size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}

/* ── Session timeline entries, shared by the Sessions and approval demos ── */

type Entry = { who: string; img?: string; action: string; actionColor: string; time: string; body: string }

function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <>
      {entries.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: 10 }}>
          {e.img ? (
            <Avatar src={e.img} size={26} radius={7} />
          ) : (
            <span style={{ ...circle(26, { background: 'rgba(74,222,128,0.15)' }), color: '#4ADE80', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>You</span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div>
              <span style={{ fontWeight: 600 }}>{e.who}</span> <span style={{ color: e.actionColor }}>{e.action}</span> <span style={{ color: 'var(--dim)' }}>· {e.time}</span>
            </div>
            <div style={{ color: 'var(--muted)' }}>{e.body}</div>
          </div>
        </div>
      ))}
    </>
  )
}

const ASKED: Entry = { who: "Buyer's agent", img: AVATAR.buyer, action: 'asked Document Agent', actionColor: '#8C929C', time: '10:02', body: "What is the flat's floor area?" }

/* ── Sessions: the list, then the session that needs you ── */

type Status = 'working' | 'needs' | 'completed' | 'rejected'
const STATUS: Record<Status, { dot: CSSProperties; spin?: boolean; label: string; color: string }> = {
  working: { dot: circle(8, { border: '2px solid #3A3F48', borderTopColor: '#A8AEB8' }), spin: true, label: 'Working', color: '#8C929C' },
  needs: { dot: circle(8, { background: '#E3A23B' }), label: 'Needs you', color: '#E3A23B' },
  completed: { dot: circle(8, { background: '#4ADE80' }), label: 'Completed', color: '#8C929C' },
  rejected: { dot: circle(8, { border: '1px dashed #6E7480' }), label: 'Rejected', color: '#8C929C' },
}
const SESSION_COLUMNS = 'minmax(0, 2.2fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 0.8fr)'

export function SessionsDemo() {
  const ref = useRef<HTMLElement>(null)
  const { t } = useTick(ref, { staticTick: 40 })
  const bt = t % 170
  const listView = bt < 84
  const rows: { name: string; kind: Status; requester: string; updated: string }[] = [
    { name: 'Flat sale, 12 Rue Oberkampf', kind: bt < 30 ? 'working' : 'needs', requester: "Buyer's agent", updated: bt < 30 ? '1m' : 'now' },
    { name: 'Lisbon offsite weather', kind: 'completed', requester: 'Claude Code', updated: '12m' },
    { name: 'Q4 team trip itinerary', kind: 'working', requester: 'Ops assistant', updated: '3m' },
    { name: 'Supplier quote check', kind: 'completed', requester: 'Partner agent', updated: '1h' },
    { name: 'Invoice follow-up', kind: 'rejected', requester: 'Finance bot', updated: '2h' },
  ]
  const entries: (Entry & { at: number })[] = [
    { ...ASKED, at: 84 },
    { at: 98, who: 'Document Agent', img: AVATAR.doc, action: 'needs your answer below', actionColor: '#E3A23B', time: '10:02', body: 'The listing and the survey disagree.' },
  ]

  return (
    <figure ref={ref} className="mock" role="img" aria-label="The Sessions list in Hybro. A session from a buyer's agent changes to Needs you, and opening it shows the exchange as a short timeline.">
      <div aria-hidden="true" style={{ height: 420, padding: 18, fontSize: 13, overflow: 'hidden' }}>
        {listView ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Sessions</div>
            <div style={{ border: '1px solid var(--line-strong)', borderRadius: 8, padding: '7px 12px', color: '#5A606B' }}>Find a session, requester, agent, or ID</div>
            <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: SESSION_COLUMNS, gap: 10, padding: '8px 12px', background: '#15171B', fontSize: 12, color: 'var(--faint)' }}>
                <span>Name</span><span>Status</span><span>Requester</span><span>Updated</span>
              </div>
              {rows.map((r, i) => {
                const s = STATUS[r.kind]
                const hot = i === 0 && bt >= 30
                const pressed = i === 0 && bt >= 64
                return (
                  <div key={r.name} style={{ display: 'grid', gridTemplateColumns: SESSION_COLUMNS, gap: 10, alignItems: 'center', padding: '10px 12px', borderTop: '1px solid var(--line)', background: pressed ? 'rgba(227,162,59,0.16)' : hot ? 'rgba(227,162,59,0.07)' : 'transparent' }}>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={s.spin ? 'spin' : undefined} style={s.dot} />
                      <span style={{ fontSize: 12, color: s.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
                    </span>
                    <span style={{ color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.requester}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--dim)' }}>{r.updated}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--dim)' }}>5 sessions</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>← Sessions</span>
              <div style={{ fontSize: 18, fontWeight: 600 }}>Flat sale, 12 Rue Oberkampf</div>
              <Timeline entries={entries.filter((e) => bt >= e.at)} />
            </div>
            <div style={{ borderLeft: '1px solid var(--line)', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Details</div>
              <div><div style={{ color: 'var(--dim)' }}>Status</div><div style={{ color: '#E3A23B' }}>Needs you</div></div>
              <div><div style={{ color: 'var(--dim)' }}>Requester</div><div>Buyer&apos;s agent</div></div>
              <div><div style={{ color: 'var(--dim)' }}>Agents</div><div>Document Agent</div></div>
              <div><div style={{ color: 'var(--dim)' }}>Requests</div><div>1</div></div>
            </div>
          </div>
        )}
      </div>
    </figure>
  )
}

/* ── Human-in-the-loop: the agent pauses until the owner approves ── */

export function ApprovalDemo() {
  const ref = useRef<HTMLElement>(null)
  const { t } = useTick(ref, { staticTick: 179 })
  const ct = t % 180
  const pressed = ct >= 80 && ct < 104
  const entries: (Entry & { at: number })[] = [
    { ...ASKED, at: 0 },
    { at: 14, who: 'Document Agent', img: AVATAR.doc, action: 'needs your answer below', actionColor: '#E3A23B', time: '10:02', body: 'Asking the owner before replying.' },
    { at: 104, who: 'You', action: 'answered', actionColor: '#8C929C', time: '10:09', body: 'Approved' },
    { at: 120, who: 'Document Agent', img: AVATAR.doc, action: 'replied after 7s', actionColor: '#8C929C', time: '10:09', body: 'The surveyed floor area is 68.4 m², per the Carrez certificate.' },
  ]

  return (
    <figure ref={ref} className="mock" role="img" aria-label="A session where the Document Agent asks for approval before answering a buyer's agent. The owner approves, and the agent replies.">
      <div aria-hidden="true" style={{ height: 440, padding: 18, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>← Sessions</span>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: -6 }}>Flat sale, 12 Rue Oberkampf</div>
        <Timeline entries={entries.filter((e) => ct >= e.at)} />
        {ct >= 22 && ct < 104 && (
          <div style={{ border: '1px solid var(--line-strong)', borderRadius: 12, background: '#16181D', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <span className="pulse" style={circle(8, { background: '#E3A23B' })} />
              Document Agent needs your approval
            </div>
            <div>The listing says 71 m², the Carrez survey says 68.4 m². Send the buyer the surveyed 68.4 m²?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <span style={{ padding: '6px 14px', borderRadius: 8, background: '#5A1F1F', color: '#FFD6D6' }}>Reject</span>
              <span style={{ padding: '6px 14px', borderRadius: 8, fontWeight: 600, color: 'var(--bg)', background: pressed ? '#7AD6E1' : '#3DBFCF', boxShadow: pressed ? '0 0 0 4px rgba(61,191,207,0.3)' : 'none' }}>Approve</span>
            </div>
          </div>
        )}
      </div>
    </figure>
  )
}
