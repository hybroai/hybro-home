import type { Metadata } from 'next'
import Link from 'next/link'
import { type LogoName, FrameworkLogo, TextMark } from '../../../components/site/agent-mark'
import { AdapterInstall } from '../../../components/site/adapter-install'
import { SiteFooter, SiteHeader } from '../../../components/site/chrome'
import { HybroMark } from '../../../components/site/icons'

export const metadata: Metadata = {
  title: 'A2A Adapter',
  description: 'Turn any agent into an A2A agent. Expose a coding agent with one command, or wrap your own framework in a few lines of Python.',
}

const ADAPTER_REPO = 'https://github.com/hybroai/a2a-adapter'

type Streaming = 'yes' | 'no' | 'optional'
type Adapter = { name: string; cls: string; streaming: Streaming } & ({ logo: LogoName } | { mark: string; markColor: string })

const ADAPTERS: Adapter[] = [
  { name: 'Claude Code', cls: 'ClaudeCodeAdapter', logo: 'claude', streaming: 'yes' },
  { name: 'Codex', cls: 'CodexAdapter', logo: 'codex', streaming: 'no' },
  { name: 'Pi', cls: 'PiAdapter', logo: 'pi', streaming: 'yes' },
  { name: 'OpenClaw', cls: 'OpenClawAdapter', logo: 'openclaw', streaming: 'no' },
  { name: 'Hermes Agent', cls: 'HermesAdapter', logo: 'hermes', streaming: 'yes' },
  { name: 'n8n', cls: 'N8nAdapter', logo: 'n8n', streaming: 'no' },
  { name: 'LangGraph', cls: 'LangGraphAdapter', logo: 'langgraph', streaming: 'yes' },
  { name: 'LangChain', cls: 'LangChainAdapter', logo: 'langchain', streaming: 'yes' },
  { name: 'CrewAI', cls: 'CrewAIAdapter', logo: 'crewai', streaming: 'no' },
  { name: 'Ollama', cls: 'OllamaAdapter', logo: 'ollama', streaming: 'yes' },
  { name: 'Python callable', cls: 'CallableAdapter', mark: 'fn', markColor: '#3DBFCF', streaming: 'optional' },
  { name: 'Custom class', cls: 'BaseA2AAdapter', mark: '{ }', markColor: '#B385F0', streaming: 'optional' },
]

const STREAMING: Record<Streaming, { label: string; color: string }> = {
  yes: { label: 'Streaming', color: '#4ADE80' },
  no: { label: 'No streaming', color: '#8C929C' },
  optional: { label: 'Streaming optional', color: '#A8AEB8' },
}

const HANDLES = [
  'A2A Agent Card generation',
  'JSON-RPC and REST routes from the official A2A SDK',
  'Task lifecycle and SSE streaming',
  'Push-notification configuration',
  'A2A 1.0 and v0.3 compatibility handling',
  'Adapter cleanup when the server shuts down',
]

// Agents shown passing through the adapter in the flow graphic.
const FLOW_AGENTS: { name: string; logo: LogoName }[] = [
  { name: 'Claude Code', logo: 'claude' },
  { name: 'Codex', logo: 'codex' },
  { name: 'LangGraph', logo: 'langgraph' },
  { name: 'CrewAI', logo: 'crewai' },
  { name: 'n8n', logo: 'n8n' },
]

const codeBlock = {
  flex: 1, margin: '0 22px 22px', padding: '16px 18px', borderRadius: 10, background: '#0A0B0E', border: '1px solid var(--line)',
  fontSize: 13, lineHeight: 1.9, overflow: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
} as const

const PROMPT = <span style={{ color: '#3DBFCF' }}>$ </span>
const KW = ({ children }: { children: React.ReactNode }) => <span style={{ color: '#B385F0' }}>{children}</span>
const STR = ({ children }: { children: React.ReactNode }) => <span style={{ color: '#A5D6A7' }}>{children}</span>

/** Agents on the left pass through the adapter and come out on the right as A2A agents. */
function AdapterFlow() {
  return (
    <div
      role="img"
      aria-label={`The A2A Adapter turns ${FLOW_AGENTS.map((a) => a.name).join(', ')} into A2A agents.`}
      style={{ border: '1px solid var(--line)', borderRadius: 16, background: '#0F1114', padding: '28px clamp(16px, 4vw, 40px)' }}
    >
      <div className="flowgrid" aria-hidden="true">
        <div className="mono" style={{ gridColumn: 1, gridRow: 1, fontSize: 11, letterSpacing: '0.14em', color: 'var(--faint)' }}>YOUR AGENTS</div>
        <div className="mono flow-mid" style={{ gridColumn: 3, gridRow: 1, fontSize: 11, letterSpacing: '0.14em', textAlign: 'center' }}>A2A ADAPTER</div>
        <div className="mono" style={{ gridColumn: -2, gridRow: 1, fontSize: 11, letterSpacing: '0.14em', color: 'var(--cyan)' }}>A2A AGENTS</div>
        <div className="flow-mid flow-gate" style={{ gridColumn: 3, gridRow: `2 / ${FLOW_AGENTS.length + 2}` }}>
          <div className="flow-gate-inner">
            <HybroMark size={52} />
            <span style={{ fontSize: 17, fontWeight: 700 }}>A2A Adapter</span>
          </div>
        </div>
        {FLOW_AGENTS.map((agent, i) => (
          <FlowRow key={agent.name} agent={agent} row={i + 2} />
        ))}
      </div>
    </div>
  )
}

function FlowRow({ agent, row }: { agent: { name: string; logo: LogoName }; row: number }) {
  return (
    <>
      <div style={{ gridColumn: 1, gridRow: row, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span className="flow-tile">
          <span style={{ opacity: 0.85, display: 'flex' }}><FrameworkLogo name={agent.logo} size={22} /></span>
        </span>
        <span className="flow-name">{agent.name}</span>
      </div>
      <div className="flow-line flow-mid" style={{ gridColumn: 2, gridRow: row }} />
      <div className="flow-line out flow-mid" style={{ gridColumn: 4, gridRow: row }} />
      <div className="flow-arrow" style={{ gridColumn: 2, gridRow: row }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </div>
      <div style={{ gridColumn: -2, gridRow: row, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span className="flow-tile flow-tile-a2a">
          <FrameworkLogo name={agent.logo} size={22} />
          <span className="mono flow-badge">A2A</span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.3 }}>
          <span className="flow-name" style={{ color: 'var(--text)', fontWeight: 600 }}>{agent.name}</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--cyan)' }}>A2A agent</span>
        </span>
      </div>
    </>
  )
}

function CodeCard({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid var(--line-strong)', borderRadius: 14, overflow: 'hidden', background: 'var(--panel)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 22px 0' }}>
        <h3 style={{ marginBottom: 6, fontSize: 20 }}>{title}</h3>
        <p style={{ marginBottom: 16, fontSize: 15, color: 'var(--muted)' }}>{body}</p>
      </div>
      <pre className="mono" style={codeBlock}>{children}</pre>
    </div>
  )
}

export default function A2AAdapterPage() {
  return (
    <div className="site" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(179,133,240,0.10), transparent 600px)' }}>
      <SiteHeader current="a2a-adapter" />

      <main className="container">
        {/* Hero */}
        <section style={{ padding: '96px 0 88px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="mono" style={{ display: 'inline-flex', gap: 10, padding: '0 20px', marginBottom: 26, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', borderLeft: '1px solid #2E323A', borderRight: '1px solid #2E323A' }}>
            <span className="grad" style={{ fontWeight: 600 }}>a2a adapter</span>
            <span>open source</span>
            <span>python</span>
          </div>
          <h1 className="h1 h1-compact" style={{ marginBottom: 20, maxWidth: 860 }}>
            Turn any agent into an <span className="grad">A2A agent</span>
          </h1>
          <p style={{ marginBottom: 40, fontSize: 20, color: 'var(--muted)', maxWidth: 640 }}>
            Expose a coding agent with one command, or wrap your own framework in a few lines of Python. Then any A2A client, Hybro included, can find it and send it work.
          </p>
          <AdapterInstall />
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <a href={ADAPTER_REPO} className="btn btn-primary">View on GitHub</a>
            <a href="https://pypi.org/project/a2a-adapter/" className="btn btn-accent">PyPI</a>
          </div>
        </section>

        {/* How it fits */}
        <section className="section" style={{ padding: '88px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px 48px', marginBottom: 36 }}>
            <h2 className="h2" style={{ lineHeight: 1.1, maxWidth: 520 }}>One small layer in front of your agent</h2>
            <p style={{ maxWidth: 420, fontSize: 16, color: 'var(--muted)' }}>
              Your agent keeps its own code. The adapter turns it into a standard A2A server that any client can call.
            </p>
          </div>
          <AdapterFlow />
        </section>

        {/* Two ways */}
        <section className="section" style={{ padding: '88px 0' }}>
          <h2 className="h2" style={{ marginBottom: 16, textAlign: 'center' }}>Two ways to get there</h2>
          <p className="lead" style={{ margin: '0 auto 40px', maxWidth: 560, textAlign: 'center' }}>
            Use the CLI for agents you already have installed. Use the Python SDK for your own code.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 20 }}>
            <CodeCard title="CLI: expose an agent" body="Run it in the project folder the agent should work in.">
              {PROMPT}a2a-adapter claude --port 9010{'\n'}
              {PROMPT}a2a-adapter codex --port 9011{'\n'}
              {PROMPT}a2a-adapter pi --port 9012{'\n'}
              {PROMPT}a2a-adapter openclaw --port 9008{'\n'}
              <span style={{ color: 'var(--dim)' }}># native agent options go after --</span>{'\n'}
              {PROMPT}a2a-adapter codex --port 9011 -- --sandbox workspace-write
            </CodeCard>
            <CodeCard title="Python: wrap your own agent" body="Any async function or framework becomes an A2A server.">
              <KW>from</KW> a2a_adapter <KW>import</KW> CallableAdapter, serve_agent{'\n\n'}
              <KW>async def</KW> <span style={{ color: '#3DBFCF' }}>echo</span>(inputs):{'\n'}
              {'    '}<KW>return</KW> <STR>f&quot;Echo: {'{'}inputs[&apos;message&apos;]{'}'}&quot;</STR>{'\n\n'}
              adapter = CallableAdapter(func=echo, name=<STR>&quot;Echo&quot;</STR>){'\n'}
              serve_agent(adapter, port=<span style={{ color: '#E3A23B' }}>9000</span>)
            </CodeCard>
          </div>
        </section>

        {/* Ready-made adapters */}
        <section className="section" style={{ padding: '88px 0' }}>
          <h2 className="h2" style={{ marginBottom: 40, textAlign: 'center' }}>Ready-made adapters</h2>
          <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 12 }}>
            {ADAPTERS.map((adapter) => {
              const streaming = STREAMING[adapter.streaming]
              return (
                <li key={adapter.cls} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 16, background: 'var(--panel)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span aria-hidden="true" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, border: '1px solid #2E323A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {'logo' in adapter ? <FrameworkLogo name={adapter.logo} size={22} /> : <TextMark mark={adapter.mark} color={adapter.markColor} size={12} />}
                  </span>
                  <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{adapter.name}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adapter.cls}</span>
                    <span style={{ fontSize: 12, color: streaming.color }}>{streaming.label}</span>
                  </div>
                </li>
              )
            })}
            <li style={{ display: 'flex' }}>
              <a href={`${ADAPTER_REPO}/issues`} className="adapter-more">
                <span aria-hidden="true" className="adapter-more-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </span>
                <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>More on the way</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>your framework next</span>
                  <span style={{ fontSize: 12, color: 'var(--cyan)' }}>Request or contribute →</span>
                </span>
              </a>
            </li>
          </ul>
        </section>

        {/* What it handles */}
        <section className="section" style={{ padding: '88px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 48, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h2 className="h2">You write the agent. The adapter speaks A2A.</h2>
              <p className="lead">Built on the official A2A SDK, so your agent behaves like any other A2A server on the network.</p>
            </div>
            <ul style={{ padding: 0, listStyle: 'none', borderTop: '1px solid var(--line)' }}>
              {HANDLES.map((item) => (
                <li key={item} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
                  <span aria-hidden="true" style={{ color: '#3DBFCF' }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next step */}
        <section className="section" style={{ padding: '96px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <h2 className="h2">Then bring it into <span className="grad">Hybro</span></h2>
          <p className="lead" style={{ maxWidth: 560 }}>
            Register your agent by its URL, and talk to it in a room, through MCP, or let other agents reach it.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <Link href="/#start" className="btn btn-primary">Get started with Hybro</Link>
            <Link href="/docs/a2a-adapter/quick-start" className="btn btn-outline">Adapter quick start</Link>
          </div>
        </section>
      </main>

      <div className="container">
        <SiteFooter />
      </div>
    </div>
  )
}
