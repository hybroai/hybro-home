import Link from 'next/link'
import { AVATAR } from '../../components/site/avatars'
import { Avatar, DISCORD_URL, GITHUB_URL, SiteFooter, SiteHeader } from '../../components/site/chrome'
import { AgentBall } from '../../components/site/home/agent-ball'
import { Composer } from '../../components/site/home/composer'
import { ApprovalDemo, RoomDemo, SessionsDemo } from '../../components/site/home/features'
import { Install } from '../../components/site/home/install'
import { UseCaseMarquee } from '../../components/site/home/use-cases'
import { Mention } from '../../components/site/mention'

const FEATURES = [
  {
    eyebrow: 'ROOMS',
    color: '#3DBFCF',
    title: 'Multiple agents, working together',
    body: 'Mention the agents you need in one message. Hybro hands each its part, shows who is working on what, and brings their answers together into one reply.',
    demo: <RoomDemo />,
  },
  {
    eyebrow: 'SESSIONS',
    color: '#B385F0',
    title: 'Let other agents work with yours',
    body: 'Clients and their agents reach your agents through sessions. Your list shows every conversation at a glance, and the ones that need you stand out. Open one to read the whole exchange as a simple story.',
    demo: <SessionsDemo />,
    demoFirst: true,
  },
  {
    eyebrow: 'HUMAN-IN-THE-LOOP',
    color: '#E3A23B',
    title: 'Agents propose. You decide.',
    body: 'When an agent is about to do something that matters, it stops and asks you. The work waits, for minutes or days, until you approve or reject. Your decision goes on the record.',
    demo: <ApprovalDemo />,
  },
]

const stepCard = { width: '100%', marginTop: 8, padding: '16px 18px', borderRadius: 12, border: '1px solid var(--line-strong)', textAlign: 'left', height: 132 } as const

const STEPS = [
  {
    color: '#B385F0',
    rgb: '179,133,240',
    title: 'Install and set up',
    body: 'Install the CLI and pick your model provider. Hybro runs on your machine.',
    card: (
      <div className="mono" style={{ ...stepCard, background: '#0A0B0E', fontSize: 13, lineHeight: 2 }}>
        <div><span style={{ color: '#B385F0' }}>$ </span>npm i -g @hybroai/cli</div>
        <div><span style={{ color: '#B385F0' }}>$ </span>hybro setup</div>
        <div style={{ color: 'var(--muted)' }}><span style={{ color: '#4ADE80' }}>✓ </span>Saved ~/.hybro/config.json</div>
      </div>
    ),
  },
  {
    color: '#7FA2E0',
    rgb: '127,162,224',
    title: 'Register your agents',
    body: 'Add any A2A agent by its URL, or start with the agents that come with Hybro.',
    card: (
      <div style={{ ...stepCard, background: 'var(--panel)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={AVATAR.weather} size={36} radius={9} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Weather Agent</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>http://weather-agent:9001</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ADE80' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />Online
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['weather forecast', 'current conditions'].map((skill) => (
            <span key={skill} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#1A1D23', color: 'var(--muted)' }}>{skill}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    color: '#3DBFCF',
    rgb: '61,191,207',
    title: 'Start talking',
    body: 'Chat with your agents in a room, or let your AI assistant reach them through MCP.',
    card: (
      <div style={{ ...stepCard, padding: '14px 16px', background: 'var(--panel)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
        <div style={{ alignSelf: 'flex-end', maxWidth: '92%', background: '#1E2127', border: '1px solid var(--line-strong)', borderRadius: 10, padding: '7px 11px', fontSize: 13 }}>
          <Mention name="Weather Agent" img={AVATAR.weather} />{' '}What&apos;s the forecast for Lisbon?
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--faint)' }}>
          <span style={{ padding: '1px 7px', borderRadius: 4, border: '1px solid rgba(179,133,240,0.4)', color: '#B385F0' }}>MCP</span>
          <span className="mono" style={{ color: 'var(--muted)' }}>127.0.0.1:8001/mcp</span>
        </div>
      </div>
    ),
  },
]

/** Step badge: a gradient ring with a soft glow and a 01/02/03 numeral. */
function StepNumber({ n, color, rgb }: { n: number; color: string; rgb: string }) {
  return (
    <span
      style={{
        width: 56, height: 56, padding: 2, borderRadius: '50%',
        backgroundImage: `conic-gradient(from 200deg, ${color}, rgba(${rgb},0.12) 45%, ${color} 80%, #FFFFFF 90%, ${color})`,
        boxShadow: `0 0 0 8px var(--bg), 0 0 32px rgba(${rgb},0.35)`,
      }}
    >
      <span
        style={{
          width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: `radial-gradient(circle at 50% 28%, rgba(${rgb},0.30), var(--bg) 72%)`,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700, fontSize: 21, letterSpacing: '-0.02em',
            backgroundImage: `linear-gradient(180deg, #FFFFFF 15%, ${color} 95%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}
        >
          {String(n).padStart(2, '0')}
        </span>
      </span>
    </span>
  )
}

export default function HomePage() {
  return (
    <div className="site" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(61,191,207,0.10), transparent 640px)' }}>
      <SiteHeader current="home" />

      <main className="container">
        {/* Hero */}
        <section style={{ padding: '88px 0 96px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="h1" style={{ marginBottom: 20, maxWidth: 880 }}>
            <span className="grad">The Interoperability Engine</span>
            <br />
            for AI Agents
          </h1>
          <p style={{ marginBottom: 40, fontSize: 20, color: 'var(--muted)', maxWidth: 600 }}>
            Connect any agent. Let them work together. Stay in charge of what matters.
          </p>
          <Composer />
          <Install />
        </section>

        {/* Agents */}
        <section id="agents" className="section">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 className="h2" style={{ marginBottom: 16 }}>Works with any agent or harness</h2>
            <p className="lead" style={{ margin: '0 auto', maxWidth: 620 }}>
              Coding agents, frameworks, workflow tools and your own bots meet in one network. Hybro sits in the middle and connects them through one open standard, A2A.
            </p>
          </div>
          <AgentBall />
          <div style={{ margin: '40px auto 0', maxWidth: 680, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 16, padding: '28px 24px', border: '1px solid var(--line)', borderRadius: 14, background: 'var(--panel)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
                Any agent. <span className="grad">One command</span> from A2A.
              </span>
              <span style={{ fontSize: 15, color: 'var(--muted)' }}>
                The A2A Adapter wraps Claude Code, Codex, LangGraph, CrewAI or plain Python, so it can join your Hybro network.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/a2a-adapter" className="btn btn-accent" style={{ minHeight: 40, padding: '0 16px', fontSize: 14 }}>
                A2A Adapter →
              </Link>
              <a href="https://github.com/hybroai/a2a-adapter" className="btn btn-outline" style={{ minHeight: 40, padding: '0 16px', fontSize: 14, fontWeight: 400 }}>
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section" style={{ display: 'flex', flexDirection: 'column', gap: 112 }}>
          {FEATURES.map((feature) => {
            const copy = (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <span className="mono" style={{ fontSize: 12, letterSpacing: '0.16em', color: feature.color }}>{feature.eyebrow}</span>
                <h3 className="h2-feature">{feature.title}</h3>
                <p className="lead">{feature.body}</p>
              </div>
            )
            return (
              <div key={feature.eyebrow} className="feature-grid">
                {feature.demoFirst ? <>{feature.demo}{copy}</> : <>{copy}{feature.demo}</>}
              </div>
            )
          })}
        </section>

        {/* Three steps */}
        <section id="start" className="section">
          <h2 className="h2" style={{ marginBottom: 16, textAlign: 'center' }}>Start using Hybro in three steps</h2>
          <p className="lead" style={{ margin: '0 auto 64px', maxWidth: 520, textAlign: 'center' }}>
            From install to your first conversation in a few minutes.
          </p>
          <div style={{ position: 'relative' }}>
            <div
              className="hide-sm"
              aria-hidden="true"
              style={{ position: 'absolute', left: '16.6%', right: '16.6%', top: 27, height: 2, backgroundImage: 'linear-gradient(to right, #B385F0, #7FA2E0, #3DBFCF)', opacity: 0.55 }}
            />
            <ol style={{ position: 'relative', padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '48px 32px' }}>
              {STEPS.map((step, i) => (
                <li key={step.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
                  <StepNumber n={i + 1} color={step.color} rgb={step.rgb} />
                  <h3 style={{ marginTop: 6, fontSize: 22, fontWeight: 600 }}>{step.title}</h3>
                  <p className="step-body" style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 300 }}>{step.body}</p>
                  {step.card}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" className="section">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '24px 64px', alignItems: 'end', marginBottom: 56 }}>
            <h2 className="h2" style={{ lineHeight: 1.12 }}>
              What changes when your agents can <span className="grad">work with others</span>
            </h2>
            <p className="lead">
              An agent alone can only do what it was built for. Connected, it can ask a specialist, answer a partner, or hand off to another tool, while a person still signs off on what matters. Here is where that leads.
            </p>
          </div>
        </section>
        <UseCaseMarquee />

        {/* Community */}
        <section className="section" style={{ padding: '96px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <h2 className="h2">
            Join the Open Source <span className="grad">Agent Community</span>
          </h2>
          <p className="lead" style={{ maxWidth: 640 }}>
            Hybro Core is released under the permissive Apache License 2.0. We welcome contributions, agent integrations, and feedback.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 }}>
            <a href={GITHUB_URL} className="btn btn-primary">Star on GitHub</a>
            <a href={DISCORD_URL} className="btn btn-outline">Join Discord</a>
          </div>
        </section>
      </main>

      <div className="container">
        <SiteFooter />
      </div>
    </div>
  )
}
