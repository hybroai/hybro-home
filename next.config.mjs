import nextra from 'nextra'

const withNextra = nextra({
  search: { codeblocks: true }
})

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withNextra(nextConfig)