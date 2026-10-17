import type { Metadata } from 'next'
import { Head } from 'nextra/components'
import { Inter, Space_Grotesk } from 'next/font/google'

// Inter for body text, Space Grotesk for headings and the wordmark, on the site and in the docs.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  metadataBase: new URL('https://hybro.ai'),
  title: { default: 'Hybro: The Interoperability Engine for AI Agents', template: '%s | Hybro' },
  description: 'Connect any agent. Let them work together. Stay in charge of what matters.',
  icons: {
    icon: '/favicon.svg',
  }
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <Head
        color={{
          // Dark: the site's cyan, #3DBFCF.
          hue: { light: 192, dark: 187 },
          saturation: { light: 85, dark: 60 },
          lightness: { light: 35, dark: 52 },
        }}
        backgroundColor={{
          light: 'rgb(243,244,246)',
          dark: 'rgb(13,15,18)',
        }}
      />
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
