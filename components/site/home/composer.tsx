'use client'

import { useRef } from 'react'
import { AVATAR } from '../avatars'
import { Avatar } from '../chrome'
import { Mention } from '../mention'
import { useTick } from '../use-tick'

const PROMPTS = [
  { agents: [{ name: 'Weather Agent', img: AVATAR.weather }, { name: 'Travel Planner Agent', img: AVATAR.travel }], text: "Plan a 7-day trip to Oahu, Hawaii, for four people, and check Honolulu's weather forecast for the next 7 days" },
  { agents: [{ name: 'Document Agent', img: AVATAR.doc }, { name: 'Legal Agent', img: AVATAR.legal }], text: "Cross-check the flat's sale documents, flag any conflicts, and ask me before replying to the buyer's agent" },
  { agents: [{ name: 'Finance Agent', img: AVATAR.finance }, { name: 'Sales Agent', img: AVATAR.sales }], text: 'Find clients with overdue invoices from last quarter and draft polite reminders for my approval' },
  { agents: [{ name: 'Support Agent', img: AVATAR.image }, { name: 'Data Agent', img: AVATAR.data }], text: "Summarize this week's support tickets and chart the three most common issues" },
  { agents: [{ name: 'Research Agent', img: AVATAR.story }, { name: 'Data Agent', img: AVATAR.data }], text: 'Compare five open-source vector databases on our sample data and write a one-page recommendation' },
  { agents: [{ name: 'Story Agent', img: AVATAR.story }, { name: 'Image Generator Agent', img: AVATAR.image }], text: 'Give me a short fun story about AI Agents and generate an Image based on the story' },
]

// Ticks of 60 ms: type one character per tick, hold 1.5 s, delete two per tick, pause 0.3 s.
const HOLD = 25
const PAUSE = 5
const span = (text: string) => text.length + HOLD + Math.ceil(text.length / 2) + PAUSE
const CYCLE = PROMPTS.reduce((sum, p) => sum + span(p.text), 0)

function frame(t: number) {
  let ht = t % CYCLE
  let index = 0
  while (ht >= span(PROMPTS[index].text)) {
    ht -= span(PROMPTS[index].text)
    index += 1
  }
  const prompt = PROMPTS[index]
  const length = prompt.text.length
  let typed: number
  if (ht < length) typed = ht
  else if (ht < length + HOLD) typed = length
  else typed = Math.max(0, length - 2 * (ht - length - HOLD))
  return { prompt, typed, pausing: ht >= length + HOLD && typed === 0 }
}

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', 'aria-hidden': true } as const

// Composer toolbar icons, shared with the room demo.
export const GlobeIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} stroke="#3DBFCF"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
)
export const SparkIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} stroke="#3DBFCF"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></svg>
)
export const ChevronIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}><path d="M6 9l6 6 6-6" /></svg>
)
export const PaperclipIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}><path d="M21 12.5l-8.6 8.6a5 5 0 0 1-7.1-7.1l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9" /></svg>
)
export const AtIcon = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
)
export const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...iconProps} strokeWidth={2.4} strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
)

export function Composer() {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTick(ref, { staticTick: PROMPTS[0].text.length })
  const { prompt, typed, pausing } = frame(t)
  const blink = t % 12 < 6 ? 1 : 0

  return (
    <div ref={ref} style={{ width: '100%', maxWidth: 760, marginBottom: 56, textAlign: 'left' }}>
      <div
        role="img"
        aria-label={`Example message to ${prompt.agents.map((a) => a.name).join(' and ')}: ${prompt.text}`}
        style={{ background: '#1A1D23', border: '1px solid var(--line-strong)', borderRadius: 12, padding: '14px 18px 10px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
      >
        <div aria-hidden="true" style={{ minHeight: 56, fontSize: 15, lineHeight: '28px' }}>
          {pausing ? (
            <span style={{ color: '#5A606B' }}>Type a message... Use @ to mention agents</span>
          ) : (
            <>
              {prompt.agents.map((agent) => (
                <span key={agent.name} style={{ marginRight: 6 }}>
                  <Mention name={agent.name} img={agent.img} />
                </span>
              ))}
              <span>{prompt.text.slice(0, typed)}</span>
              <span style={{ display: 'inline-block', width: 1, height: 18, marginLeft: 1, verticalAlign: -3, background: 'var(--text)', opacity: blink }} />
            </>
          )}
        </div>
        <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 14, color: 'var(--muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {pausing ? (
                <>
                  <GlobeIcon />
                  <span>All agents</span>
                </>
              ) : (
                <>
                  <span style={{ display: 'inline-flex' }}>
                    {prompt.agents.map((agent) => <Avatar key={agent.name} src={agent.img} size={18} radius={4} style={{ marginRight: -3 }} />)}
                  </span>
                  <span style={{ marginLeft: 6 }}>2 agents</span>
                </>
              )}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <SparkIcon />
              Ultimate
              <ChevronIcon />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--muted)' }}>
            <PaperclipIcon />
            <AtIcon />
            <span style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg)', background: typed > 0 ? '#3DBFCF' : 'rgba(61,191,207,0.4)' }}>
              <SendIcon />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
