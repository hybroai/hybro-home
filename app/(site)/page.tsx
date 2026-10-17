import Link from 'next/link'
import { DISCORD_URL, GITHUB_URL, SiteFooter, SiteHeader } from '../../components/site/chrome'
import { AgentGlobe } from '../../components/site/home/agent-globe'
import { AppPreview } from '../../components/site/home/app-preview'
import { CommandCard, HeroCopy } from '../../components/site/home/copy-command'
import { Features } from '../../components/site/home/features'
import { UseCaseMarquee } from '../../components/site/home/use-cases'

function Requirements({ items }: { items: [string, string][] }) {
  return (
    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0 0 36px', padding: 0, listStyle: 'none' }} aria-label="Requirements">
      {items.map(([label, color]) => (
        <li key={label} className="mono req-chip">
          <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
          {label}
        </li>
      ))}
    </ul>
  )
}

export default function HomePage() {
  return (
    <div className="site home" style={{ position: 'relative' }}>
      <div className="home-mist" aria-hidden="true" />
      <SiteHeader current="home" />

      <main className="container" style={{ position: 'relative' }}>
        {/* Hero */}
        <section id="product" style={{ padding: '104px 0 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', scrollMarginTop: 40 }}>
          <h1 className="home-h1" style={{ marginBottom: 22 }}>
            <span className="home-h1-gradient">The Interoperability Engine</span>
            <br />
            for AI Agents
          </h1>
          <p style={{ marginBottom: 36, maxWidth: 620, fontSize: 18, color: 'var(--muted)' }}>
            Connect any agent. Let them work together.
            <br />
            Stay in charge of what matters.
          </p>
          <HeroCopy command="npm i -g @hybroai/cli" />
        </section>

        <AppPreview />

        {/* Features */}
        <section id="features" style={{ padding: '120px 0 40px', scrollMarginTop: 40 }}>
          <h2 className="home-h2" style={{ marginBottom: 56, textAlign: 'center' }}>
            Agents that work together
            <br />
            People who stay in charge
          </h2>
          <Features />
        </section>

        {/* Agents */}
        <section id="agents" style={{ padding: '100px 0 40px', scrollMarginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="home-h2" style={{ marginBottom: 14 }}>Works with any agent or harness</h2>
            <p className="home-sub" style={{ margin: '0 auto', maxWidth: 600 }}>
              Coding agents, frameworks, workflow tools and your own bots meet in one network, joined through one open standard.
            </p>
          </div>
          <AgentGlobe />
        </section>

        {/* User experience */}
        <section id="start" style={{ padding: '100px 0 40px', scrollMarginTop: 40 }}>
          <h2 className="home-h2" style={{ marginBottom: 12 }}>User experience</h2>
          <p className="home-sub" style={{ marginBottom: 16 }}>Install Hybro on your machine and start chatting with agents in minutes.</p>
          <Requirements items={[['Docker Compose v2.24+', '#2496ED'], ['Node.js 18+', '#5FA04E'], ['macOS · Linux · WSL', '#A8AEB8']]} />
          <div className="home-grid">
            <CommandCard
              title="Install with npm"
              lines={['npm install -g @hybroai/cli', 'hybro setup', 'hybro start']}
              copyText="npm install -g @hybroai/cli && hybro setup && hybro start"
            />
          </div>
        </section>

        {/* Developer experience */}
        <section style={{ padding: '80px 0 40px' }}>
          <h2 className="home-h2" style={{ marginBottom: 12 }}>Developer experience</h2>
          <p className="home-sub" style={{ marginBottom: 16 }}>Build Hybro from source and run the whole stack yourself.</p>
          <Requirements items={[['git', '#F05133'], ['Docker', '#2496ED'], ['uv', '#DE5FE9']]} />
          <div className="home-grid">
            <CommandCard
              title="Install from source"
              text="Clone the repository and build the stack yourself."
              lines={['curl -fsSL https://raw.githubusercontent.com/hybroai/hybro/main/install.sh | sh', './scripts/hybro setup', './scripts/hybro start --build']}
              copyText="curl -fsSL https://raw.githubusercontent.com/hybroai/hybro/main/install.sh | sh"
            />
          </div>
        </section>

        {/* Use cases */}
        <section id="use-cases" style={{ padding: '100px 0 0', textAlign: 'center' }}>
          <h2 className="home-h2" style={{ marginBottom: 12 }}>What changes when agents work together</h2>
          <p className="home-sub" style={{ margin: '0 auto 44px', maxWidth: 600 }}>
            An agent alone does what it was built for. Connected, it can ask a specialist, answer a partner, or hand off, while a person signs off on what matters.
          </p>
        </section>
        <UseCaseMarquee />

        {/* Community */}
        <section style={{ position: 'relative', marginTop: 110, padding: '120px 0 110px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div className="particles" aria-hidden="true" />
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, marginLeft: 'calc(50% - 50vw)', width: '100vw', pointerEvents: 'none', backgroundImage: 'radial-gradient(ellipse 40% 50% at 50% 60%, rgba(58,130,225,0.20), transparent 70%)' }}
          />
          <h2 className="home-h2" style={{ position: 'relative' }}>Join the open-source agent community</h2>
          <p className="home-sub" style={{ position: 'relative', maxWidth: 600 }}>
            Hybro is released under the Apache License 2.0. We welcome contributions, agent integrations, and feedback.
          </p>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 6 }}>
            <a href={GITHUB_URL} className="btn btn-light">Star on GitHub</a>
            <Link href="/docs" className="btn btn-ghost">Read the docs</Link>
            <a href={DISCORD_URL} className="btn btn-ghost">Join Discord</a>
            <Link href="/a2a-adapter" className="btn btn-ghost">A2A Adapter</Link>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
