import type { Metadata } from 'next'
import { Head } from 'nextra/components'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'], variable: '--font-space-grotesk' })

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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: { light: 192, dark: 180 },
          saturation: { light: 85, dark: 100 },
          lightness: { light: 35, dark: 60 },
        }}
        backgroundColor={{
          light: 'rgb(243,244,246)',
          dark: 'rgb(15,17,26)',
        }}
      />
      <body className={`${inter.className} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  )
}
