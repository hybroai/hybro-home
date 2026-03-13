import { Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { Inter } from 'next/font/google'
import { ChatWidget } from '../components/chat-widget'
import 'nextra-theme-docs/style.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
      <Head
        color={{
          hue: { light: 192, dark: 180 },
          saturation: { light: 85, dark: 100 },
          lightness: { light: 35, dark: 60 },
        }}
        backgroundColor={{
          light: 'rgb(243,244,247)',
          dark: 'rgb(15,17,25)',
        }}
      />
      <body className={inter.className}>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/hybroai"
          editLink={null}
          feedback={{
            content: 'Question? Give us feedback',
            labels: 'feedback'
          }}
        >
          {children}
        </Layout>
        <ChatWidget />
      </body>
    </html>
  )
}