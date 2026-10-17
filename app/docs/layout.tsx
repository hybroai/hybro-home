import type { Metadata } from 'next'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { ChatWidget } from '../../components/chat-widget'
import { Logo } from '../../components/logo'
import 'nextra-theme-docs/style.css'
import '../globals.css'

export const metadata: Metadata = {
  title: { default: 'HYBRO AI Documentation', template: '%s | HYBRO AI Docs' },
  description: 'Documentation for HYBRO AI products',
}

const navbar = (
  <Navbar
    logoLink="/"
    logo={<Logo />}
    projectLink="https://github.com/hybroai/hybro"
  />
)

const FOOTER_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/a2a-adapter', label: 'A2A Adapter' },
  { href: 'https://github.com/hybroai/hybro', label: 'GitHub' },
  { href: 'https://discord.gg/2S5pCKzUmJ', label: 'Discord' },
  { href: 'https://x.com/HybroAI', label: 'X' },
  { href: 'https://www.linkedin.com/company/hybroai', label: 'LinkedIn' },
]

// Same centered footer as the home page.
const footer = (
  <Footer className="hybro-docs-footer">
    <div className="hybro-docs-footer-links">
      {FOOTER_LINKS.map((link) => (
        <a key={link.label} href={link.href}>{link.label}</a>
      ))}
    </div>
    <span>© 2026 Hybro AI. All rights reserved.</span>
  </Footer>
)

export default async function DocsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Layout
        navbar={navbar}
        footer={footer}
        nextThemes={{ defaultTheme: 'dark' }}
        pageMap={await getPageMap('/docs')}
        docsRepositoryBase="https://github.com/hybroai/hybro-documents"
        editLink={null}
        feedback={{
          content: 'Question? Give us feedback',
          labels: 'feedback'
        }}
      >
        {children}
      </Layout>
      <ChatWidget />
    </>
  )
}
