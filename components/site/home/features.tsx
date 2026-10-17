'use client'

import { type ReactNode, useRef } from 'react'
import { type LogoName, FrameworkLogo } from '../agent-mark'
import { AVATAR } from '../avatars'
import { Avatar } from '../chrome'
import { GithubIcon } from '../icons'
import { Mention } from '../mention'
import { useTick } from '../use-tick'
import { Tui } from './tui'

// With reduced motion every demo shows this tick: answers written, a session
// waiting, and the approval card asking.
const STATIC_TICK = 199

const ANSWER = 'Day 1: Waikiki and Diamond Head at sunrise.\nDay 3: North Shore moves to Wednesday, rain on Thursday.'

type Kind = 'working' | 'needs' | 'completed' | 'rejected'
const STATUS: Record<Kind, { label: string; color: string }> = {
  working: { label: 'Working', color: '#8C929C' },
  needs: { label: 'Needs you', color: '#E3A23B' },
  completed: { label: 'Completed', color: '#8C929C' },
  rejected: { label: 'Rejected', color: '#8C929C' },
}

function StatusDot({ kind }: { kind: Kind }) {
  if (kind === 'working') return <span className="spin app-spin app-spin-sm" />
  if (kind === 'rejected') return <span className="app-dot" style={{ border: '1px dashed #7A808C' }} />
  return <span className="app-dot" style={{ background: kind === 'needs' ? '#E3A23B' : '#4ADE80' }} />
}

function FeatureCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="home-card feature-card">
      <h3>{title}</h3>
      <p className="home-card-text" style={{ marginBottom: 22 }}>{text}</p>
      {children}
    </div>
  )
}

/** Two agents work in parallel, then the combined answer types in. */
function RoomDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTick(ref, { staticTick: STATIC_TICK })
  const aT = t % 200
  const rows = [
    { name: 'Weather Agent', img: AVATAR.weather, end: 50 },
    { name: 'Travel Planner Agent', img: AVATAR.travel, end: 80 },
  ]
  return (
    <div ref={ref} className="feature-demo" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ background: '#1E2127', border: '1px solid #2A2E35', borderRadius: 10, padding: '8px 12px' }}>
        <Mention name="Weather Agent" img={AVATAR.weather} />{' '}
        <Mention name="Travel Planner Agent" img={AVATAR.travel} /> Plan a 7-day Oahu trip for four
      </div>
      {rows.map((row) => {
        const working = aT < row.end
        return (
          <div key={row.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ position: 'relative', width: 24, height: 24 }}>
              <Avatar src={row.img} size={24} radius={12} />
              {working && <span className="working-ring" />}
            </span>
            <span style={{ flex: 1 }}>{row.name}</span>
            <span style={{ fontSize: 12, color: working ? '#3DBFCF' : '#4ADE80' }}>{working ? 'Running' : 'Completed'}</span>
          </div>
        )
      })}
      <div style={{ minHeight: 60, color: '#C9CDD4', whiteSpace: 'pre-line' }}>{ANSWER.slice(0, Math.max(0, (aT - 90) * 3))}</div>
    </div>
  )
}

/** The session list, where one session turns into "Needs you". */
function SessionsDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTick(ref, { staticTick: STATIC_TICK })
  const bT = t % 140
  const rows: { name: string; kind: Kind; requester: string }[] = [
    { name: 'Flat sale, 12 Rue Oberkampf', kind: bT < 40 ? 'working' : 'needs', requester: "Buyer's agent" },
    { name: 'Lisbon offsite weather', kind: 'completed', requester: 'Claude Code' },
    { name: 'Q4 team trip itinerary', kind: 'working', requester: 'Ops assistant' },
    { name: 'Supplier quote check', kind: 'completed', requester: 'Partner agent' },
    { name: 'Invoice follow-up', kind: 'rejected', requester: 'Finance bot' },
  ]
  return (
    <div ref={ref} className="feature-demo" style={{ overflow: 'hidden' }}>
      {rows.map((row, i) => (
        <div
          key={row.name}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            borderTop: i ? '1px solid #1F2228' : 0,
            background: row.kind === 'needs' ? 'rgba(227,162,59,0.10)' : 'transparent',
          }}
        >
          <span style={{ flex: 1, minWidth: 0, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: 96, flexShrink: 0 }}>
            <StatusDot kind={row.kind} />
            <span style={{ fontSize: 12, color: STATUS[row.kind].color }}>{STATUS[row.kind].label}</span>
          </span>
          <span className="hide-sm" style={{ width: 96, color: '#A8AEB8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.requester}</span>
        </div>
      ))}
    </div>
  )
}

/** An approval request; the person approves and the agent replies. */
function ApprovalDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const { t } = useTick(ref, { staticTick: STATIC_TICK })
  const cT = t % 160
  const pressing = cT >= 60 && cT < 80
  return (
    <div ref={ref} className="feature-demo" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {cT < 80 ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <span className="pulse app-dot" style={{ background: '#E3A23B' }} />
            Document Agent needs your approval
          </div>
          <div style={{ color: '#C9CDD4' }}>Send the buyer the surveyed 68.4 m² instead of the listed 71 m²?</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <span style={{ padding: '6px 14px', borderRadius: 8, background: '#5A1F1F', color: '#FFD6D6' }}>Reject</span>
            <span
              style={{
                padding: '6px 14px', borderRadius: 8, fontWeight: 600, color: '#0A0B0D',
                background: pressing ? '#7AD6E1' : '#3DBFCF',
                boxShadow: pressing ? '0 0 0 4px rgba(61,191,207,0.3)' : 'none',
              }}
            >
              Approve
            </span>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10 }}>
            <span className="app-you">You</span>
            <div><b>You</b> <span style={{ color: '#8C929C' }}>answered · 10:09</span><div style={{ color: '#A8AEB8' }}>Approved</div></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar src={AVATAR.doc} size={26} radius={13} />
            <div><b>Document Agent</b> <span style={{ color: '#8C929C' }}>replied · 10:09</span><div style={{ color: '#A8AEB8' }}>The surveyed floor area is 68.4 m², per the Carrez certificate.</div></div>
          </div>
        </>
      )}
      <div style={{ height: 16 }} />
    </div>
  )
}

const FLOW_LOGOS: LogoName[] = ['claude', 'codex', 'langgraph', 'crewai', 'n8n']

/** Agents pass through the A2A Adapter and come out as A2A agents. */
function AdapterFlow() {
  return (
    <div className="adapter-flow" role="img" aria-label="Claude Code, Codex, LangGraph, CrewAI and n8n pass through the A2A Adapter and become A2A agents.">
      {FLOW_LOGOS.map((name, i) => (
        <div key={name} style={{ display: 'contents' }}>
          <span style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid #2A2E35', background: '#111317', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
            <FrameworkLogo name={name} size={22} />
          </span>
          <div className="flow-line" />
          <span className={`adapter-gate${i === 0 ? ' first' : ''}${i === FLOW_LOGOS.length - 1 ? ' last' : ''}`}>{i === 2 ? 'A2A Adapter' : ''}</span>
          <div className="flow-line out" />
          <span className="flow-tile flow-tile-a2a">
            <FrameworkLogo name={name} size={22} />
            <span className="mono flow-badge">A2A</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function Features() {
  return (
    <>
      <div className="home-grid">
        <FeatureCard title="Many agents, one message" text="Mention the agents you need. Hybro hands each its part and brings their answers together.">
          <RoomDemo />
        </FeatureCard>
        <FeatureCard title="Other agents can work with yours" text="Clients and their agents reach yours through sessions. The ones that need you stand out.">
          <SessionsDemo />
        </FeatureCard>
        <FeatureCard title="Agents propose. You decide." text="When something matters, the agent stops and asks. The work waits until you approve or reject.">
          <ApprovalDemo />
        </FeatureCard>
        <FeatureCard title="Set up from the terminal" text="Run hybro to pick a model provider, then start, stop and inspect the stack from one screen.">
          <Tui />
        </FeatureCard>
      </div>
      <div className="home-card" style={{ marginTop: 20, padding: 30, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '28px 40px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontSize: 20, fontWeight: 500 }}>Any agent, one command from A2A</h3>
          <p className="home-card-text">The A2A Adapter wraps Claude Code, Codex, LangGraph, CrewAI and more, so they join your network as A2A agents.</p>
          <a href="https://github.com/hybroai/a2a-adapter" className="btn btn-accent btn-accent-lg">
            <GithubIcon className="github-btn-icon" />
            A2A Adapter on GitHub →
          </a>
        </div>
        <AdapterFlow />
      </div>
    </>
  )
}
