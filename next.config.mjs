import nextra from 'nextra'

const withNextra = nextra({
  search: { codeblocks: true },
  defaultShowCopyCode: true
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/hybro-platform/:path*',
        destination: '/hybro/:path*',
        permanent: true,
      },
    ]
  },
}

export default withNextra(nextConfig)
