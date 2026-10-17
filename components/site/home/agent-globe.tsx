'use client'

import { type ReactNode, useRef } from 'react'
import { type LogoName, FrameworkLogo } from '../agent-mark'
import { AVATAR } from '../avatars'
import { Avatar } from '../chrome'
import { useFrameLoop } from '../use-tick'

// A quiet globe: grey dots on a slowly turning sphere, agent names floating
// above their points on the front face, and the Hybro logo's two nested cubes
// breathing at the centre.

type Mark = { avatar: string } | { logo: LogoName } | { tile: string } | null

const AGENTS: [string, Mark][] = [
  ['Claude Code', { logo: 'claude' }], ['Weather Agent', { avatar: AVATAR.weather }], ['Codex', { logo: 'codex' }], ['Document Agent', { avatar: AVATAR.doc }],
  ['LangGraph', { logo: 'langgraph' }], ['Travel Planner', { avatar: AVATAR.travel }], ['CrewAI', { logo: 'crewai' }], ['Data Agent', { avatar: AVATAR.data }],
  ['n8n', { logo: 'n8n' }], ['Story Agent', { avatar: AVATAR.story }], ['Pi', { logo: 'pi' }], ['Finance Agent', { avatar: AVATAR.finance }],
  ['Ollama', { logo: 'ollama' }], ['Research Agent', { avatar: AVATAR.story }],
  ['LangChain', { logo: 'langchain' }], ['Legal Agent', { avatar: AVATAR.legal }], ['OpenClaw', { logo: 'openclaw' }], ['Sales Agent', { avatar: AVATAR.sales }],
  ['Hermes', { logo: 'hermes' }], ['Support Agent', { avatar: AVATAR.image }], ['Any A2A agent', null], ["Buyer's agent", { avatar: AVATAR.buyer }],
  ['Image Generator', { avatar: AVATAR.image }], ['Test Agent', { avatar: AVATAR.data }],
  ['omp', { logo: 'omp' }], ['Muse Code', { logo: 'muse' }], ['DeepSeek Harness', { logo: 'deepseek' }], ['Kimi Code', { tile: '/logos/kimi.png' }],
]

type Vec = [number, number, number]

/** Points spread evenly over a sphere (Fibonacci lattice), optionally clipped to |y| <= yMax. */
function fibonacci(n: number, yMax: number): Vec[] {
  const out: Vec[] = []
  for (let i = 0; i < n; i++) {
    const y = yMax - (2 * yMax * (i + 0.5)) / n
    const r = Math.sqrt(1 - y * y)
    const th = i * 2.399963
    out.push([r * Math.cos(th), y, r * Math.sin(th)])
  }
  return out
}

const DOTS = fibonacci(520, 1)
const SPOTS = fibonacci(AGENTS.length, 0.84)

const RADIUS = 42
const TILT = 0.28
const CUBE = 0.07
const CORNERS: Vec[] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]

const dot = (x: number, y: number, r: number) => `M${(x - r).toFixed(2)},${y.toFixed(2)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`
const seg = (p: number[], q: number[]) => `M${p[0].toFixed(2)},${p[1].toFixed(2)}L${q[0].toFixed(2)},${q[1].toFixed(2)}`

type Frame = {
  back: string
  mid: string
  front: string
  agentDots: string
  chips: { x: number; y: number; vis: number }[]
  inner: string
  outer: string
  bridge: string
  corners: string
}

/** Everything that moves, at time `rt` in 60 ms ticks. */
function frame(rt: number): Frame {
  const ry = rt * 0.004
  const view = ([x, y, z]: Vec): Vec => {
    const X = x * Math.cos(ry) + z * Math.sin(ry)
    const Z = -x * Math.sin(ry) + z * Math.cos(ry)
    return [50 + RADIUS * X, 50 - RADIUS * (y * Math.cos(TILT) - Z * Math.sin(TILT)), y * Math.sin(TILT) + Z * Math.cos(TILT)]
  }

  let back = ''
  let mid = ''
  let front = ''
  for (const p of DOTS) {
    const [x, y, z] = view(p)
    if (z < -0.2) back += dot(x, y, 0.32)
    else if (z < 0.35) mid += dot(x, y, 0.38)
    else front += dot(x, y, 0.45)
  }

  let agentDots = ''
  const chips = SPOTS.map((p) => {
    const [x, y, z] = view(p)
    const vis = Math.max(0, Math.min(1, (z - 0.15) / 0.35))
    if (vis > 0.1) agentDots += dot(x, y, 0.6)
    return { x, y, vis }
  })

  // The logo's cubes at a fixed 3/4 view. The inner one grows to the outer
  // size while the outer one shrinks to the inner size, then back.
  const f = (1 - Math.cos(rt * 0.035)) / 2
  const place = ([x, y, z]: Vec, s: number) => {
    const x1 = x * s * Math.cos(0.62) + z * s * Math.sin(0.62)
    const z1 = -x * s * Math.sin(0.62) + z * s * Math.cos(0.62)
    return [50 + RADIUS * x1, 50 - RADIUS * (y * s * Math.cos(0.42) - z1 * Math.sin(0.42))]
  }
  const sA = CUBE * (0.42 + 0.58 * f)
  const sB = CUBE * (1 - 0.58 * f)
  const small = CORNERS.map((c) => place(c, Math.min(sA, sB)))
  const big = CORNERS.map((c) => place(c, Math.max(sA, sB)))
  let inner = ''
  let outer = ''
  let bridge = ''
  let corners = ''
  for (const [i, j] of EDGES) {
    inner += seg(small[i], small[j])
    outer += seg(big[i], big[j])
  }
  CORNERS.forEach((_, i) => {
    bridge += seg(small[i], big[i])
    corners += dot(small[i][0], small[i][1], 0.42) + dot(big[i][0], big[i][1], 0.26)
  })

  return { back, mid, front, agentDots, chips, inner, outer, bridge, corners }
}

const chipStyle = ({ x, y, vis }: Frame['chips'][number]) => ({
  left: `${x.toFixed(2)}%`,
  top: `${y.toFixed(2)}%`,
  opacity: vis.toFixed(2),
  zIndex: String(Math.round(vis * 10)),
})

function ChipMark({ mark }: { mark: Mark }): ReactNode {
  if (!mark) return null
  if ('avatar' in mark) return <Avatar src={mark.avatar} size={22} radius={6} />
  if ('tile' in mark) return <Avatar src={mark.tile} size={22} radius={6} />
  return (
    <span className="globe-logo">
      <FrameworkLogo name={mark.logo} size={16} />
    </span>
  )
}

const INITIAL = frame(0)
type PathKey = 'back' | 'mid' | 'front' | 'agentDots' | 'inner' | 'outer' | 'bridge' | 'corners'

export function AgentGlobe() {
  const box = useRef<HTMLDivElement>(null)
  const paths = useRef<Partial<Record<PathKey, SVGPathElement | null>>>({})
  const chips = useRef<(HTMLDivElement | null)[]>([])

  // Direct DOM updates on every display frame; React renders the first frame only.
  useFrameLoop(box, (rt) => {
    const next = frame(rt)
    for (const key of Object.keys(paths.current) as PathKey[]) paths.current[key]?.setAttribute('d', next[key])
    next.chips.forEach((chip, i) => {
      const el = chips.current[i]
      if (el) Object.assign(el.style, chipStyle(chip))
    })
  })

  const path = (key: PathKey) => ({ ref: (el: SVGPathElement | null) => { paths.current[key] = el }, d: INITIAL[key] })

  return (
    <div
      ref={box}
      role="img"
      aria-label={`A globe of agents connected through Hybro: ${AGENTS.map(([name]) => name).join(', ')}.`}
      style={{ position: 'relative', width: '100%', maxWidth: 600, aspectRatio: '1 / 1', margin: '24px auto 0' }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <radialGradient id="globe-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5E90D8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#5E90D8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path {...path('back')} fill="#8C929C" opacity="0.18" />
        <path {...path('mid')} fill="#A8AEB8" opacity="0.38" />
        <circle cx="50" cy="50" r="8" fill="url(#globe-core-glow)" />
        <path {...path('outer')} fill="none" stroke="#3DBFCF" strokeOpacity="0.45" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path {...path('bridge')} fill="none" stroke="#3DBFCF" strokeOpacity="0.35" strokeWidth="0.22" strokeLinecap="round" />
        <path {...path('inner')} fill="none" stroke="#3DBFCF" strokeWidth="0.55" strokeLinecap="round" />
        <path {...path('corners')} fill="#7AD6E1" opacity="0.85" />
        <path {...path('front')} fill="#C9CDD4" opacity="0.72" />
        <path {...path('agentDots')} fill="#E3E6EB" opacity="0.85" />
      </svg>
      {AGENTS.map(([name, mark], i) => (
        <div
          key={name}
          ref={(el) => { chips.current[i] = el }}
          aria-hidden="true"
          className="globe-chip"
          // The chip sits just above its point, so the point itself stays visible.
          style={{ ...chipStyle(INITIAL.chips[i]), transform: 'translate(-50%, calc(-100% - 10px))', paddingLeft: mark ? 3 : 10 }}
        >
          <ChipMark mark={mark} />
          <span>{name}</span>
        </div>
      ))}
    </div>
  )
}
