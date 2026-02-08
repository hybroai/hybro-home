# HYBRO AI Documentation

Documentation site for HYBRO AI products, built with [Next.js](https://nextjs.org) and [Nextra](https://nextra.site/) Docs Theme.

## Contents

- **A2A Adapter** — Open Source A2A Protocol Adapter SDK ([GitHub](https://github.com/hybroai/a2a-adapter) · [PyPI](https://pypi.org/project/a2a-adapter/))

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the documentation.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Project Structure

- `app/` — Next.js App Router (layout, catch-all route for MDX)
- `content/` — Documentation content (MDX + `_meta.js` for sidebar)
  - `content/index.mdx` — Home page
  - `content/a2a-adapter/` — A2A Adapter docs
- `mdx-components.tsx` — MDX component overrides
- `next.config.mjs` — Nextra config

## Adding Documentation

1. Add or edit `.mdx` files under `content/`.
2. Update `content/_meta.js` or the section’s `_meta.js` for sidebar order and titles.
3. Use relative links between docs (e.g. `/a2a-adapter/installation`).

## Deploy

The site can be deployed to [Vercel](https://vercel.com) or any platform that supports Next.js static/server export.
