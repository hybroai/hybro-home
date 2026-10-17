import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/docs',
  search: { codeblocks: true },
  defaultShowCopyCode: true
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The docs used to live at the root of docs.hybro.ai.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'docs.hybro.ai' }],
        destination: 'https://hybro.ai/docs/:path*',
        permanent: true,
      },
      {
        source: '/hybro-platform/:path*',
        destination: '/docs/hybro/:path*',
        permanent: true,
      },
      // Docs pages used to live at the site root.
      {
        source: '/:section(hybro|hybro-hub)/:path*',
        destination: '/docs/:section/:path*',
        permanent: true,
      },
      // /a2a-adapter itself is now the landing page; only its sub-pages moved.
      {
        source: '/a2a-adapter/:path+',
        destination: '/docs/a2a-adapter/:path+',
        permanent: true,
      },
      // Pages from the old marketing site.
      ...['/core', '/about', '/pricing'].map((source) => ({
        source,
        destination: '/',
        permanent: true,
      })),
    ]
  },
}

export default withNextra(nextConfig)
