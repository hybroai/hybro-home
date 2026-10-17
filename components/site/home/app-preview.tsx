'use client'

import { type CSSProperties, type ReactNode, useState } from 'react'
import { HybroMark, HybroWordmark } from '../icons'
import { Mention } from '../mention'
import { useCopy } from '../use-tick'
import {
  APP,
  CHAT_STATE,
  type Chat,
  type ChatAnswer,
  type ChatStatus,
  type Decision,
  GRAPH,
  GRAPH_H,
  GRAPH_W,
  MCP_SNIPPETS,
  MCP_URL,
  type McpTab,
  NET_AGENTS,
  SESSION_STATUS,
  SUBNETS,
  type SessionKind,
  getChats,
  getSessions,
} from './app-data'

type View = 'overview' | 'network' | 'sessions' | 'chats' | 'connect'

const VIEWS: { key: View; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'network', label: 'Network' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'chats', label: 'Chats' },
  { key: 'connect', label: 'Connect' },
]

// Sidebar icons and their colors, as in the app's navigation.
const NAV_ICON: Record<View, ReactNode> = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(240 60% 75%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  network: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(180 100% 70%)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </svg>
  ),
  sessions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 70% 65%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />
    </svg>
  ),
  chats: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(142 70% 65%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  ),
  connect: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(270 80% 70%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
    </svg>
  ),
}

const cardBox: CSSProperties = { borderRadius: 12, border: `1px solid ${APP.border}`, background: APP.card, overflow: 'hidden' }
const ellipsis: CSSProperties = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }

function Img({ src, size, radius, style }: { src: string; size: number; radius: number; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element -- small static avatars
  return <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, ...style }} />
}

function Badge() {
  return <span className="app-badge">1</span>
}

/** Status dot: a spinner while running, amber when someone is needed. */
function ChatDot({ status }: { status: ChatStatus }) {
  if (status === 'running') return <span className="spin app-spin" style={{ borderTopColor: APP.primary }} />
  if (status === 'needs') return <span className="app-dot" style={{ background: APP.warning }} />
  return null
}

function SessionDot({ kind }: { kind: SessionKind }) {
  if (kind === 'working') return <span className="spin app-spin app-spin-sm" />
  if (kind === 'rejected') return <span className="app-dot" style={{ border: '1px dashed #7A808C' }} />
  return <span className="app-dot" style={{ background: kind === 'needs' ? '#E3A23B' : '#4ADE80' }} />
}

function SessionStatus({ kind }: { kind: SessionKind }) {
  const st = SESSION_STATUS[kind]
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: st.color, whiteSpace: 'nowrap' }}>
      <SessionDot kind={kind} />
      {st.label}
    </span>
  )
}

function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="app-link">
      {children}
    </button>
  )
}

function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
      {action}
    </div>
  )
}

const circlePath = (x: number, y: number, r: number) => `M${(x - r).toFixed(1)},${y.toFixed(1)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`
const MINI = {
  edges: GRAPH.links.map(([i, j]) => `M${GRAPH.nodes[i].x.toFixed(1)},${GRAPH.nodes[i].y.toFixed(1)}L${GRAPH.nodes[j].x.toFixed(1)},${GRAPH.nodes[j].y.toFixed(1)}`).join(''),
  subnets: GRAPH.nodes.filter((n) => n.kind === 'subnet').map((n) => circlePath(n.x, n.y, 9)).join(''),
  online: GRAPH.nodes.filter((n) => n.kind === 'agent' && !n.item.offline).map((n) => circlePath(n.x, n.y, 7)).join(''),
  offline: GRAPH.nodes.filter((n) => n.kind === 'agent' && n.item.offline).map((n) => circlePath(n.x, n.y, 7)).join(''),
}
const MOST_CALLED = NET_AGENTS.slice().sort((a, b) => b.calls - a.calls).slice(0, 3)

/** A clickable mock of the Hybro app: Overview, Network, Sessions, Chats and Connect. */
export function AppPreview() {
  const [view, setView] = useState<View>('overview')
  const [chatIndex, setChatIndex] = useState(0)
  const [sessionIndex, setSessionIndex] = useState(-1)
  const [decision, setDecision] = useState<Decision>('')
  const [chatAnswer, setChatAnswer] = useState<ChatAnswer>('')
  const [historyOpen, setHistoryOpen] = useState(true)
  const [responsesOpen, setResponsesOpen] = useState(true)
  const [netMode, setNetMode] = useState<'topology' | 'structure'>('topology')
  const [node, setNode] = useState(-1)
  const [mcpTab, setMcpTab] = useState<McpTab>('claude')

  const chats = getChats(chatAnswer)
  const sessions = getSessions(decision)

  const go = (next: View) => {
    setView(next)
    if (next === 'sessions') setSessionIndex(-1)
  }
  const openChat = (i: number) => {
    setView('chats')
    setChatIndex(i)
    setResponsesOpen(true)
  }
  const openSession = (i: number) => {
    setView('sessions')
    setSessionIndex(i)
  }

  const historyRow = (i: number) => {
    const on = view === 'chats' && chatIndex === i
    return (
      <button key={i} type="button" onClick={() => openChat(i)} className={`app-history-row${on ? ' on' : ''}`} aria-current={on || undefined}>
        <span style={{ flex: 1, minWidth: 0, ...ellipsis }}>{chats[i].title}</span>
        <ChatDot status={chats[i].status} />
      </button>
    )
  }

  let body: ReactNode
  if (view === 'overview') {
    const tiles = [
      { label: 'Sessions', value: '5', color: 'hsl(142 70% 65%)', detail: decision ? 'Open' : '1 need you', warn: !decision, pick: () => go('sessions') },
      { label: 'Chats', value: String(chats.length), color: 'hsl(142 70% 65%)', detail: chatAnswer ? '1 running' : '1 need input', warn: !chatAnswer, pick: () => openChat(chatAnswer ? 3 : 4) },
      { label: 'Agents', value: String(NET_AGENTS.length), color: 'hsl(180 100% 70%)', detail: '1 offline', warn: false, pick: () => go('network') },
      { label: 'MCP gateway', value: 'Ready', color: 'hsl(270 80% 70%)', detail: '127.0.0.1:8001', warn: false, pick: () => go('connect') },
    ]
    body = (
      <div className="app-overview" style={{ flex: 1, minHeight: 0, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>Overview</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => go('network')} className="app-btn">+ Add agent</button>
            <button type="button" onClick={() => openChat(0)} className="app-btn app-btn-primary">New chat</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
          {tiles.map((tile) => (
            <button key={tile.label} type="button" onClick={tile.pick} className="app-tile">
              <span style={{ fontSize: 11.5, color: APP.mutedFg }}>{tile.label}</span>
              <span style={{ fontSize: 21, fontWeight: 600, lineHeight: 1.25, color: tile.color }}>{tile.value}</span>
              <span style={{ fontSize: 11.5, color: tile.warn ? APP.warning : APP.mutedFg, fontWeight: tile.warn ? 500 : 400 }}>{tile.detail}</span>
            </button>
          ))}
        </div>
        <div className="app-overview-cols">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
            <SectionTitle title="Recent sessions" action={<LinkButton onClick={() => go('sessions')}>All sessions ›</LinkButton>} />
            <div style={cardBox}>
              {sessions.slice(0, 3).map((s, i) => (
                <button key={s.name} type="button" onClick={() => openSession(i)} className="app-list-row">
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}>
                    <span style={{ fontWeight: 500, ...ellipsis }}>{s.name}</span>
                    <span style={{ fontSize: 11.5, color: APP.mutedFg, ...ellipsis }}>{`${s.requester} · ${s.agents} · ${s.updated}`}</span>
                  </span>
                  <SessionStatus kind={s.kind} />
                  <span style={{ color: '#7A808C' }}>›</span>
                </button>
              ))}
            </div>
            <SectionTitle title="Recent chats" action={<LinkButton onClick={() => openChat(0)}>All chats ›</LinkButton>} />
            <div style={cardBox}>
              {[3, 4, 0].map((i, k) => {
                const st = CHAT_STATE[chats[i].status]
                return (
                  <button key={i} type="button" onClick={() => openChat(i)} className="app-list-row">
                    <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.35 }}>
                      <span style={{ fontWeight: 500, ...ellipsis }}>{chats[i].title}</span>
                      <span style={{ fontSize: 11.5, color: APP.mutedFg }}>{['now', '4m ago', '18m ago'][k]}</span>
                    </span>
                    {st.label && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: st.color }}>
                        <ChatDot status={chats[i].status} />
                        {st.label}
                      </span>
                    )}
                    <span style={{ color: '#7A808C' }}>›</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="hide-sm" style={{ flexDirection: 'column', gap: 8, minHeight: 0, display: 'flex' }}>
            <SectionTitle title="Network" action={<LinkButton onClick={() => go('network')}>Open network ›</LinkButton>} />
            <button type="button" onClick={() => go('network')} aria-label="Open network" style={{ ...cardBox, padding: 8, cursor: 'pointer' }}>
              <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} style={{ width: '100%', height: 120, display: 'block' }} aria-hidden="true">
                <path d={MINI.edges} stroke={APP.edge} strokeWidth="2" fill="none" />
                <path d={MINI.subnets} fill={APP.primary} />
                <path d={MINI.online} fill={APP.agent} />
                <path d={MINI.offline} fill="none" stroke="hsl(215 12% 45%)" strokeWidth="2.5" strokeDasharray="3 3" />
              </svg>
            </button>
            <SectionTitle title="Most-called agents" />
            <div style={cardBox}>
              {MOST_CALLED.map((a, i) => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderTop: i ? `1px solid ${APP.border}` : 0 }}>
                  <Img src={a.img} size={26} radius={8} />
                  <span style={{ flex: 1, minWidth: 0, ...ellipsis }}>{a.name}</span>
                  <span style={{ fontSize: 12, color: APP.mutedFg }}>{a.calls} calls</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  } else if (view === 'network') {
    body = <NetworkView mode={netMode} setMode={setNetMode} node={node} setNode={setNode} />
  } else if (view === 'sessions') {
    const selected = sessionIndex >= 0 ? sessions[sessionIndex] : null
    body = (
      <div className="app-pane" style={{ flex: 1, overflow: 'hidden', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!selected ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Sessions</div>
            <div style={{ border: '1px solid #2A2E35', borderRadius: 8, padding: '7px 12px', color: '#5A606B' }}>Find a session, requester, agent, or ID</div>
            <div style={{ border: '1px solid #24272E', borderRadius: 12, overflow: 'hidden' }}>
              <div className="app-session-cols" style={{ padding: '8px 14px', background: '#15171C', fontSize: 12, color: '#8C929C' }}>
                <span>Name</span><span>Status</span><span>Requester</span><span>Updated</span>
              </div>
              {sessions.map((s, i) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSessionIndex(i)}
                  className="app-session-cols app-session-row"
                  style={{ background: s.kind === 'needs' ? 'rgba(227,162,59,0.08)' : 'transparent' }}
                >
                  <span style={{ fontWeight: 600, ...ellipsis }}>{s.name}</span>
                  <SessionStatus kind={s.kind} />
                  <span style={{ color: '#A8AEB8', ...ellipsis }}>{s.requester}</span>
                  <span className="mono" style={{ fontSize: 12, color: '#7A808C' }}>{s.updated}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#7A808C' }}>Click a session to open it.</div>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setSessionIndex(-1)} className="app-link" style={{ alignSelf: 'flex-start', padding: 0, fontSize: 12.5, color: '#A8AEB8' }}>
              ← Sessions
            </button>
            <div className="app-session-detail">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{selected.name}</div>
                {selected.entries.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    {e.img ? <Img src={e.img} size={26} radius={13} /> : <span className="app-you">You</span>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div>
                        <b>{e.who}</b> <span style={{ color: e.actionColor }}>{e.action}</span> <span style={{ color: '#7A808C' }}>· {e.time}</span>
                      </div>
                      <div style={{ color: '#A8AEB8' }}>{e.body}</div>
                    </div>
                  </div>
                ))}
                {sessionIndex === 0 && !decision && (
                  <AskCard
                    title="Document Agent needs your approval"
                    text="The listing says 71 m², the Carrez survey says 68.4 m². Send the buyer the surveyed 68.4 m²?"
                    no={{ label: 'Reject', onClick: () => setDecision('rejected'), danger: true }}
                    yes={{ label: 'Approve', onClick: () => setDecision('approved') }}
                  />
                )}
              </div>
              <div className="app-session-side">
                <div style={{ fontWeight: 600, fontSize: 13 }}>Details</div>
                <div><div style={{ color: '#7A808C' }}>Status</div><div style={{ color: SESSION_STATUS[selected.kind].color }}>{SESSION_STATUS[selected.kind].label}</div></div>
                <div><div style={{ color: '#7A808C' }}>Requester</div><div>{selected.requester}</div></div>
                <div><div style={{ color: '#7A808C' }}>Agents</div><div>{selected.agents}</div></div>
              </div>
            </div>
          </>
        )}
      </div>
    )
  } else if (view === 'chats') {
    body = (
      <ChatView
        chat={chats[chatIndex]}
        hitl={chatIndex === 4 && !chatAnswer}
        onAnswer={setChatAnswer}
        responsesOpen={responsesOpen}
        toggleResponses={() => setResponsesOpen((open) => !open)}
      />
    )
  } else {
    body = <ConnectView tab={mcpTab} setTab={setMcpTab} />
  }

  return (
    <figure className="app-window">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid #1F2228', background: '#15171C' }}>
        {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
      </div>

      {/* Small screens: a row of chips replaces the sidebar. */}
      <div className="show-sm app-chips" role="tablist" aria-label="App views">
        {VIEWS.map((v) => (
          <button key={v.key} type="button" role="tab" aria-selected={view === v.key} onClick={() => go(v.key)} className="chip-btn">
            {v.label}
          </button>
        ))}
      </div>

      <div className="app-body">
        <aside className="hide-sm app-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 14px' }}>
            <HybroMark size={22} />
            <HybroWordmark size={18} />
          </div>
          {VIEWS.map((v) => {
            const badge = (v.key === 'sessions' && !decision) || (v.key === 'chats' && !chatAnswer)
            return (
              <button
                key={v.key}
                type="button"
                onClick={() => go(v.key)}
                className={`side-btn${view === v.key ? ' on' : ''}`}
                aria-current={view === v.key || undefined}
              >
                {NAV_ICON[v.key]}
                <span style={{ flex: 1 }}>{v.label}</span>
                {badge && <Badge />}
              </button>
            )
          })}
          <button type="button" onClick={() => setHistoryOpen((open) => !open)} className="side-btn" aria-expanded={historyOpen} style={{ marginTop: 14, justifyContent: 'space-between', fontWeight: 500 }}>
            History
            <span style={{ display: 'flex', transition: 'transform 0.15s', transform: `rotate(${historyOpen ? 90 : 0}deg)` }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </button>
          {historyOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, overflow: 'hidden' }}>
              <div className="app-history-label">Pinned</div>
              {historyRow(0)}
              <div className="app-history-label" style={{ paddingTop: 8 }}>Recent</div>
              {[3, 4, 1, 2].map(historyRow)}
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderTop: '1px solid #1F2228', fontSize: 13 }}>
            <HybroMark size={26} />
            <span style={{ color: '#E3E6EB', fontWeight: 600 }}>HYBRO</span>
          </div>
        </aside>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', textAlign: 'left', fontSize: 13.5 }}>{body}</div>
      </div>
    </figure>
  )
}

type Choice = { label: string; onClick: () => void; danger?: boolean }

/** The human-in-the-loop card: an amber pulse, the question, and two choices. */
function AskCard({ title, text, no, yes }: { title: string; text: string; no: Choice; yes: Choice }) {
  return (
    <div style={{ border: '1px solid #2A2E35', borderRadius: 12, background: '#16181D', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
        <span className="pulse app-dot" style={{ background: '#E3A23B' }} />
        {title}
      </div>
      <div>{text}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={no.onClick} className={no.danger ? 'app-btn app-btn-danger' : 'app-btn app-btn-outline'}>{no.label}</button>
        <button type="button" onClick={yes.onClick} className="app-btn app-btn-accent">{yes.label}</button>
      </div>
    </div>
  )
}

function ChatView({
  chat,
  hitl,
  onAnswer,
  responsesOpen,
  toggleResponses,
}: {
  chat: Chat
  hitl: boolean
  onAnswer: (answer: ChatAnswer) => void
  responsesOpen: boolean
  toggleResponses: () => void
}) {
  const st = CHAT_STATE[chat.status]
  const responses = chat.responses.map((r) => {
    const finished = chat.status === 'done' || r.done
    return {
      ...r,
      label: finished ? 'Completed' : chat.status === 'needs' ? 'Needs input' : 'Running',
      color: finished ? '#4ADE80' : chat.status === 'needs' ? APP.warning : APP.primary,
      finished,
    }
  })
  const doneCount = responses.filter((r) => r.finished).length
  const summary = doneCount === responses.length ? 'all done' : `${doneCount} done · ${responses.length - doneCount} working`

  return (
    <>
      <div className="app-pane" style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#1E2127', border: '1px solid #2A2E35', borderRadius: 12, padding: '10px 14px' }}>
          {chat.agents.map((a) => (
            <span key={a.name} style={{ marginRight: 6 }}><Mention name={a.name} img={a.img} /></span>
          ))}
          {chat.prompt}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span className="app-dot" style={{ background: st.color }} />
          <span style={{ color: '#E3E6EB' }}>{st.state}</span>
          <span className="mono" style={{ color: '#7A808C' }}>{chat.time}</span>
        </div>
        {chat.answer && <div style={{ color: '#E3E6EB', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{chat.answer}</div>}
        {hitl && (
          <AskCard
            title="Support Agent needs your input"
            text="380 tickets this week came from the main workspace and 46 from the beta workspace. Include the beta tickets in the summary?"
            no={{ label: 'Main only', onClick: () => onAnswer('no') }}
            yes={{ label: 'Include beta', onClick: () => onAnswer('yes') }}
          />
        )}
        <div style={{ border: '1px solid #24272E', borderRadius: 10, overflow: 'hidden' }}>
          <button type="button" onClick={toggleResponses} aria-expanded={responsesOpen} className="app-responses-toggle">
            <span style={{ display: 'flex', transition: 'transform 0.15s', transform: `rotate(${responsesOpen ? 0 : -90}deg)` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </span>
            Agent responses · {responses.length} calls · {summary}
          </button>
          {responsesOpen &&
            responses.map((r) => (
              <div key={r.name} style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '8px 12px', borderTop: '1px solid #1C1F25' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Img src={r.img} size={24} radius={12} />
                  <span style={{ flex: 1, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: r.color }}>{r.label}</span>
                </div>
                <div style={{ paddingLeft: 34, fontSize: 12, color: '#7A808C' }}>└ {r.task}</div>
              </div>
            ))}
        </div>
      </div>
      <div style={{ padding: '10px 16px 14px' }}>
        <div style={{ background: '#1A1D23', border: '1px solid #2A2E35', borderRadius: 12, padding: '10px 12px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ color: '#5A606B' }}>Type a message... Use @ to mention agents</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#A8AEB8', fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3DBFCF" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
                All agents
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3DBFCF" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" /></svg>
                Ultimate
              </span>
            </div>
            <span style={{ width: 28, height: 28, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B0D', background: 'rgba(61,191,207,0.4)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function NetworkView({
  mode,
  setMode,
  node,
  setNode,
}: {
  mode: 'topology' | 'structure'
  setMode: (mode: 'topology' | 'structure') => void
  node: number
  setNode: (node: number) => void
}) {
  const selected = node >= 0 ? GRAPH.nodes[node] : null
  const related = new Set<number>()
  if (selected) {
    related.add(node)
    GRAPH.links.forEach(([i, j]) => {
      if (i === node) related.add(j)
      if (j === node) related.add(i)
    })
  }
  const subnetName = (id: string) => SUBNETS.find((s) => s.id === id)?.name ?? id

  let panel: ReactNode = null
  if (selected) {
    const isAgent = selected.kind === 'agent'
    const members = selected.kind === 'subnet' ? NET_AGENTS.filter((a) => a.subnets.includes(selected.item.id)) : []
    const info =
      selected.kind === 'agent'
        ? {
            meta: `Remote · ${selected.item.calls} room calls`,
            desc: 'Reachable in rooms, by MCP clients, and by other agents through sessions.',
            listTitle: 'Skills',
            items: selected.item.skills,
            status: selected.item.offline ? 'Offline' : 'Online',
            statusColor: selected.item.offline ? APP.offline : APP.online,
          }
        : {
            meta: `${members.length} agents`,
            desc: selected.item.desc,
            listTitle: 'Members',
            items: members.map((m) => m.name),
            status: `${members.filter((m) => !m.offline).length} online`,
            statusColor: APP.online,
          }
    panel = (
      <div className="app-net-panel" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', ...cardBox }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, borderBottom: `1px solid ${APP.border}` }}>
          {isAgent ? (
            <Img src={(selected.item as { img: string }).img} size={36} radius={8} style={{ background: APP.control, objectFit: 'contain' }} />
          ) : (
            <span style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(61,191,207,0.12)', color: APP.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
              {selected.item.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, ...ellipsis }}>{selected.item.name}</div>
            <div style={{ fontSize: 12, color: APP.mutedFg }}>{info.meta}</div>
          </div>
          <button type="button" onClick={() => setNode(-1)} aria-label="Close" className="app-link" style={{ fontSize: 13.5 }}>✕</button>
        </div>
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
          <div style={{ color: '#C9CDD4' }}>{info.desc}</div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: APP.mutedFg, marginBottom: 6 }}>{info.listTitle}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {info.items.map((item) => (
                <span key={item} style={{ fontSize: 11.5, padding: '1px 8px', borderRadius: 5, background: APP.control, color: '#C9CDD4' }}>{item}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: info.statusColor }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: info.statusColor }} />
            {info.status}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, minHeight: 0, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>Network</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', padding: 3, borderRadius: 9, background: APP.control }} role="tablist" aria-label="Network view">
          {(['topology', 'structure'] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className="app-segment">
              {m === 'topology' ? 'Topology' : 'Structure'}
            </button>
          ))}
        </div>
        <div className="hide-sm" style={{ flex: 1, minWidth: 160, alignItems: 'center', gap: 8, height: 34, padding: '0 10px', borderRadius: 9, border: '1px solid hsl(220 12% 20%)', color: '#7A808C', fontSize: 13, display: 'flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          Find an agent, skill, or subnet
        </div>
        <span className="hide-sm" style={{ alignItems: 'center', minHeight: 34, padding: '0 12px', borderRadius: 8, background: APP.control, fontSize: 13, display: 'inline-flex' }}>+ Add agent ▾</span>
        <span className="hide-sm" style={{ alignItems: 'center', minHeight: 34, padding: '0 12px', borderRadius: 8, background: APP.primary, color: APP.canvas, fontSize: 13, fontWeight: 600, display: 'inline-flex' }}>+ Create subnet</span>
      </div>

      {mode === 'topology' ? (
        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', gap: 14 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0, borderRadius: 12, border: `1px solid ${APP.border}`, background: APP.canvas, overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} role="img" aria-label="Agents and subnets. Subnets are teal, online agents grey, offline agents dashed. Select one to see its details.">
              {GRAPH.links.map(([i, j]) => {
                const on = selected && (i === node || j === node)
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={GRAPH.nodes[i].x} y1={GRAPH.nodes[i].y} x2={GRAPH.nodes[j].x} y2={GRAPH.nodes[j].y}
                    stroke={on ? APP.primary : APP.edge} strokeWidth={on ? 1.5 : 1} opacity={selected && !on ? 0.2 : 1}
                  />
                )
              })}
              {GRAPH.nodes.map((n, i) => {
                const offline = n.kind === 'agent' && n.item.offline
                return (
                  <g
                    key={n.item.name}
                    role="button"
                    tabIndex={0}
                    aria-label={n.item.name}
                    aria-pressed={node === i}
                    onClick={() => setNode(node === i ? -1 : i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setNode(node === i ? -1 : i)
                      }
                    }}
                    className="app-node"
                    style={{ cursor: 'pointer', outline: 'none' }}
                    opacity={selected && !related.has(i) ? 0.25 : 1}
                  >
                    <circle cx={n.x} cy={n.y} r="16" fill="transparent" />
                    <circle className="app-node-ring" cx={n.x} cy={n.y} r="10" fill="none" stroke={APP.primary} strokeWidth="2" opacity={node === i ? 1 : 0} />
                    <circle
                      cx={n.x} cy={n.y} r="6"
                      fill={n.kind === 'subnet' ? APP.primary : offline ? 'none' : APP.agent}
                      stroke={offline ? 'hsl(215 12% 45%)' : 'none'} strokeWidth="1.5" strokeDasharray={offline ? '2 2' : undefined}
                    />
                    <text
                      x={n.x} y={n.y - (n.kind === 'subnet' ? 14 : 12)} textAnchor="middle"
                      fontSize={n.kind === 'subnet' ? 12 : 11} fontWeight={n.kind === 'subnet' ? 600 : 400}
                      fill="hsl(210 25% 86%)" stroke={APP.canvas} strokeWidth="4" paintOrder="stroke"
                    >
                      {n.item.name}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div aria-hidden="true" style={{ position: 'absolute', right: 14, bottom: 12, display: 'flex', alignItems: 'center', gap: 2, padding: 4, ...cardBox, borderRadius: 10, color: APP.mutedFg, fontSize: 12 }}>
              <span style={{ width: 26, textAlign: 'center' }}>−</span>
              <span className="mono" style={{ padding: '0 4px' }}>141%</span>
              <span style={{ width: 26, textAlign: 'center' }}>+</span>
              <span style={{ width: 1, height: 16, background: APP.border, margin: '0 4px' }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 5px' }}><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 5px' }}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
            </div>
          </div>
          {panel}
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', borderRadius: 12, border: `1px solid ${APP.border}` }}>
          <div className="app-net-cols" style={{ background: APP.card, fontSize: 12, color: APP.mutedFg }}>
            <span>Agent</span><span>Status</span><span>Subnets</span><span style={{ textAlign: 'right' }}>Room calls</span>
          </div>
          {NET_AGENTS.map((a) => {
            const color = a.offline ? APP.offline : APP.online
            return (
              <div key={a.id} className="app-net-cols" style={{ alignItems: 'center', borderTop: `1px solid ${APP.border}` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <Img src={a.img} size={24} radius={6} style={{ background: APP.control, objectFit: 'contain' }} />
                  <span style={ellipsis}>{a.name}</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                  {a.offline ? 'Offline' : 'Online'}
                </span>
                <span style={{ fontSize: 12, color: '#C9CDD4' }}>{a.subnets.map(subnetName).join(', ')}</span>
                <span className="mono" style={{ fontSize: 12, textAlign: 'right' }}>{a.calls}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ConnectView({ tab, setTab }: { tab: McpTab; setTab: (tab: McpTab) => void }) {
  const { copied, copy } = useCopy()
  return (
    <div className="app-pane" style={{ flex: 1, overflow: 'hidden', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Connect</div>
        <div style={{ color: '#8C929C' }}>Let your AI assistant reach every agent on this Hybro through MCP.</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1px solid #2A2E35', background: '#15171C' }}>
        <span style={{ padding: '1px 7px', borderRadius: 4, border: '1px solid rgba(179,133,240,0.45)', color: '#B385F0', fontSize: 12 }}>MCP</span>
        <span className="mono" style={{ flex: 1, minWidth: 0, color: '#E3E6EB', ...ellipsis }}>{MCP_URL}</span>
        <button type="button" onClick={() => copy(MCP_URL)} className="app-btn app-btn-accent">{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <div style={{ display: 'flex', gap: 6 }} role="tablist" aria-label="MCP client">
        {([['claude', 'Claude Code'], ['json', 'Any MCP client']] as const).map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className="chip-btn">
            {label}
          </button>
        ))}
      </div>
      <pre className="mono" style={{ margin: 0, padding: '14px 16px', borderRadius: 10, border: '1px solid #24272E', background: '#0A0B0D', fontSize: 13, lineHeight: 1.8, color: '#E3E6EB', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {MCP_SNIPPETS[tab]}
      </pre>
      <div style={{ color: '#8C929C', fontSize: 12.5 }}>Then ask your assistant to find an agent: it can discover, message and check sessions on its own.</div>
    </div>
  )
}
