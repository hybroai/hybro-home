import Link from 'next/link'
import { DISCORD_URL, GITHUB_URL, SiteFooter, SiteHeader } from '../../components/site/chrome'
import { AgentGlobe } from '../../components/site/home/agent-globe'
import { AppPreview } from '../../components/site/home/app-preview'
import { CommandCard, InstallPanel } from '../../components/site/home/copy-command'
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
          <div style={{ width: '100%', maxWidth: 640 }}>
            <InstallPanel id="hero-install" />
          </div>
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
          <Requirements items={[['Docker', '#2496ED'], ['Node.js (npm only)', '#5FA04E'], ['amd64 · arm64', '#A8AEB8']]} />
          <div className="home-grid">
            <div className="home-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontSize: 20, fontWeight: 500 }}>Install and start</h3>
              <p className="home-card-text" style={{ marginBottom: 12 }}>
                One container runs the app, API, MCP gateway and sample agents. Open the address it prints and set up a model provider in Settings.
              </p>
              <InstallPanel id="start-install" start />
              <p className="home-card-text" style={{ marginTop: 4, fontSize: 14 }}>
                Both install the same <code className="mono" style={{ color: '#C9CDD4' }}>hybro</code> command. Run it again any time to start Hybro.
              </p>
            </div>
          </div>
        </section>

        {/* Developer experience */}
        <section style={{ padding: '80px 0 40px' }}>
          <h2 className="home-h2" style={{ marginBottom: 12 }}>Developer experience</h2>
          <p className="home-sub" style={{ marginBottom: 16 }}>Build Hybro from source and run the whole stack yourself.</p>
          <Requirements items={[['git', '#F05133'], ['Docker', '#2496ED']]} />
          <div className="home-grid">
            <CommandCard
              title="Install from source"
              text="Clone the repository and build the image from your working tree. It serves on port 3100, so it runs beside a released install."
              lines={['git clone https://github.com/hybroai/hybro.git', 'cd hybro', './scripts/hybro']}
              copyText="git clone https://github.com/hybroai/hybro.git && cd hybro && ./scripts/hybro"
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
