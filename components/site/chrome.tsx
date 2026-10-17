import Link from 'next/link'
import type { CSSProperties } from 'react'
import { GithubIcon, HybroMark, HybroWordmark } from './icons'

export const GITHUB_URL = 'https://github.com/hybroai/hybro'
export const DISCORD_URL = 'https://discord.gg/2S5pCKzUmJ'

/** Plain <img> for small decorative avatars and logos (static SVG files). */
export function Avatar({ src, size, radius = 6, style }: { src: string; size: number; radius?: number; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small static SVGs; next/image adds nothing here
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, ...style }} />
  )
}

function NavLink({ href, children, className, current }: { href: string; children: React.ReactNode; className: string; current?: boolean }) {
  const ariaCurrent = current ? 'page' : undefined
  if (href.startsWith('http') || href.startsWith('#')) {
    return <a href={href} className={className} aria-current={ariaCurrent}>{children}</a>
  }
  return <Link href={href} className={className} aria-current={ariaCurrent}>{children}</Link>
}

type Page = 'home' | 'a2a-adapter'

/** The floating site header shared by every page: logo, centered nav, GitHub button. */
export function SiteHeader({ current }: { current: Page }) {
  // Section links scroll in place on the home page and navigate there from other pages.
  const section = (id: string) => (current === 'home' ? `#${id}` : `/#${id}`)
  const items = [
    { href: section('product'), label: 'Product', hideSmall: true },
    { href: section('features'), label: 'Features', hideSmall: true },
    { href: section('agents'), label: 'Agents', hideSmall: true },
    { href: '/a2a-adapter', label: 'A2A Adapter', hideSmall: true, current: current === 'a2a-adapter' },
    { href: '/docs', label: 'Docs' },
  ]
  return (
    <div className="site-header">
      <header className="site-header-row">
        <Link href="/" aria-label="Hybro home" style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: 9, color: 'var(--text)' }}>
          <HybroMark size={26} />
          <HybroWordmark size={20} />
          <span className="mono hide-sm site-header-badge">Open source</span>
        </Link>
        <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 14 }}>
          {items.map((item) => (
            <NavLink key={item.label} href={item.href} current={item.current} className={`nav-pill${item.hideSmall ? ' hide-sm' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <a href={GITHUB_URL} className="github-btn" aria-label="Hybro on GitHub">
          <GithubIcon className="github-btn-icon" />
          <span className="hide-sm">GitHub</span>
        </a>
      </header>
    </div>
  )
}

const FOOTER_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/a2a-adapter', label: 'A2A Adapter' },
  { href: GITHUB_URL, label: 'GitHub' },
  { href: DISCORD_URL, label: 'Discord' },
  { href: 'https://x.com/HybroAI', label: 'X' },
  { href: 'https://www.linkedin.com/company/hybroai', label: 'LinkedIn' },
]

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        padding: '32px 0 40px',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
        textAlign: 'center',
        gap: 14,
        fontSize: 14,
        color: 'var(--faint)',
      }}
    >
      <span>© 2026 Hybro AI. All rights reserved.</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
        {FOOTER_LINKS.map((link) => (
          <NavLink key={link.label} href={link.href} className="nav-link">
            {link.label}
          </NavLink>
        ))}
      </div>
    </footer>
  )
}
