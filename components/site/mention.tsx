// Inline @-mention as the Hybro app renders it (.room-mention in hybro/frontend):
// the agent's avatar at 1.25em, then its name in semibold, in the agent's color.
// Colors come from the app's dark agent palette (lib/mention-color.ts). The app
// hashes the agent id to pick one; these mocks fix one color per agent.
const MENTION_COLOR: Record<string, string> = {
  'Weather Agent': '195 28% 75%',
  'Travel Planner Agent': '25 35% 75%',
  'Document Agent': '215 30% 76%',
  'Legal Agent': '145 22% 74%',
  'Finance Agent': '195 28% 75%',
  'Sales Agent': '265 25% 78%',
  'Support Agent': '45 28% 73%',
  'Data Agent': '170 25% 72%',
  'Research Agent': '215 30% 76%',
  'Story Agent': '340 28% 77%',
  'Image Generator Agent': '25 35% 75%',
}

export function Mention({ name, img }: { name: string; img: string }) {
  return (
    <span style={{ whiteSpace: 'nowrap', fontWeight: 600, color: `hsl(${MENTION_COLOR[name] ?? '265 25% 78%'})` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static avatar */}
      <img src={img} alt="" style={{ width: '1.25em', height: '1.25em', borderRadius: 4, verticalAlign: 'text-bottom', marginRight: 3 }} />
      {name}
    </span>
  )
}
