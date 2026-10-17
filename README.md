# HYBRO AI Website and Documentation

The public Hybro website (hybro.ai), built with [Next.js](https://nextjs.org) and the [Nextra](https://nextra.site/) Docs Theme. One deployment serves:

- `/`: the home page
- `/a2a-adapter`: the A2A Adapter landing page
- `/docs/...`: the documentation

## Contents

- **Hybro** — Open-source hybrid multi-agent platform ([GitHub](https://github.com/hybroai/hybro))
- **A2A Adapter** — Expose agent CLIs and Python frameworks as A2A servers ([GitHub](https://github.com/hybroai/a2a-adapter) · [PyPI](https://pypi.org/project/a2a-adapter/))
- **Hybro Hub** — Bridge local A2A agents into Hybro ([GitHub](https://github.com/hybroai/hybro-hub) · [PyPI](https://pypi.org/project/hybro-hub/))

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the home page and [http://localhost:3000/docs](http://localhost:3000/docs) for the documentation.

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `node scripts/generate-avatars.mjs` — Regenerate the DiceBear agent avatars in `public/avatars/`

## Project Structure

- `app/` — Next.js App Router
  - `app/layout.tsx` — Shared root layout
  - `app/(site)/` — Home page (`/`) and A2A Adapter page (`/a2a-adapter`), styled by `site.css`
  - `app/docs/` — Nextra docs layout and catch-all MDX route (`/docs/...`)
  - `app/api/chat/` — Docs chat assistant endpoint (needs a Node server)
- `components/site/` — Home and A2A Adapter page components
- `content/` — Documentation content (MDX + `_meta.js` for sidebar), served under `/docs`
  - `content/index.mdx` — Docs overview (`/docs`)
  - `content/hybro/` — Hybro docs
  - `content/hybro/configuration.mdx` — Local JSON configuration contract
  - `content/hybro-hub/` — Hybro Hub docs
  - `content/a2a-adapter/` — A2A Adapter docs
- `mdx-components.tsx` — MDX component overrides
- `next.config.mjs` — Nextra config (`contentDirBasePath: '/docs'`) and redirects

## Adding Documentation

1. Add or edit `.mdx` files under `content/`.
2. Update `content/_meta.js` or the section’s `_meta.js` for sidebar order and titles.
3. Link between docs with the `/docs` prefix (e.g. `/docs/a2a-adapter/quick-start`).

## Deploy

Deploy to [Vercel](https://vercel.com) or any platform that runs a Next.js server. A static export does not work because `/api/chat` needs a Node runtime.

### Redirects

`next.config.mjs` permanently redirects:

- `/hybro-platform/*` to `/docs/hybro/*`
- the old root-level docs paths (`/hybro/*`, `/hybro-hub/*`, `/a2a-adapter/*` sub-pages) to `/docs/...`
- `/core`, `/about`, `/pricing` to `/`

### Moving docs.hybro.ai to hybro.ai/docs

The docs used to live at the root of `docs.hybro.ai`. Point that host at the same deployment and redirect every path to `hybro.ai/docs`, keeping the path:

```text
docs.hybro.ai/            -> https://hybro.ai/docs
docs.hybro.ai/:path*      -> https://hybro.ai/docs/:path*
```

On Vercel, add `docs.hybro.ai` to the project and set it to redirect to `hybro.ai` (308), or add a host-matched redirect in `next.config.mjs`:

```js
{ source: '/:path*', has: [{ type: 'host', value: 'docs.hybro.ai' }], destination: 'https://hybro.ai/docs/:path*', permanent: true }
```

The domain-level redirect keeps the path but does not add `/docs`: `docs.hybro.ai/hybro/installation` lands on `hybro.ai/hybro/installation`, which the redirects above send on to `/docs/hybro/installation`, but `docs.hybro.ai/` lands on the home page. Use the host-matched redirect if the docs root should open `/docs`.
