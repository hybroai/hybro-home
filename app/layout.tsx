import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: { default: 'HYBRO AI Documentation', template: '%s | HYBRO AI Docs' },
  description: 'Documentation for HYBRO AI products',
  icons: {
    icon: '/favicon.svg',
  }
}

const navbar = (
  <Navbar
    logo={<b>HYBRO AI</b>}
  />
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
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/hybroai/a2a-adapter"
          editLink={null}
          feedback={{
            content: 'Question? Give us feedback',
            labels: 'feedback'
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}