import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: { default: 'HYBRO AI Documentation', template: '%s | HYBRO AI Docs' },
  description: 'Documentation for HYBRO AI products — A2A Adapter and more.'
}

const banner = <Banner storageKey="a2a-docs-banner">A2A Adapter Docs</Banner>

const navbar = (
  <Navbar
    logo={<b>HYBRO AI Documents</b>}

  />
)

const footer = (
  <Footer>
    Apache-2.0 {new Date().getFullYear()} © HYBRO AI ·{' '}
    <a href="https://github.com/hybroai/a2a-adapter" target="_blank" rel="noopener noreferrer">
      a2a-adapter
    </a>
  </Footer>
)

export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/hybroai/a2a-adapter"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}