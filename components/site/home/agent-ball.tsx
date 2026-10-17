'use client'

import { useRef } from 'react'
import { type LogoName, FrameworkLogo, TextMark } from '../agent-mark'
import { AVATAR } from '../avatars'
import { Avatar } from '../chrome'
import { useFrameLoop } from '../use-tick'

type BallAgent = { name: string } & ({ logo: LogoName } | { avatar: string } | { mark: string; markColor: string })

const AGENTS: BallAgent[] = [
  { name: 'Claude Code', logo: 'claude' },
  { name: 'Weather Agent', avatar: AVATAR.weather },
  { name: 'LangChain', logo: 'langchain' },
  { name: 'Codex', logo: 'codex' },
  { name: 'Document Agent', avatar: AVATAR.doc },
  { name: 'CrewAI', logo: 'crewai' },
  { name: 'Pi', logo: 'pi' },
  { name: 'Finance Agent', avatar: AVATAR.finance },
  { name: 'LangGraph', logo: 'langgraph' },
  { name: 'OpenClaw', logo: 'openclaw' },
  { name: 'Travel Planner', avatar: AVATAR.travel },
  { name: 'n8n', logo: 'n8n' },
  { name: 'Hermes', logo: 'hermes' },
  { name: 'Support Agent', avatar: AVATAR.image },
  { name: 'Ollama', logo: 'ollama' },
  { name: 'omp', mark: 'omp', markColor: '#C7A6F5' },
  { name: 'Research Agent', avatar: AVATAR.story },
  { name: 'Any A2A agent', mark: '+', markColor: '#3DBFCF' },
  { name: 'Data Agent', avatar: AVATAR.data },
  { name: "Buyer's agent", avatar: AVATAR.buyer },
  { name: 'Sales Agent', avatar: AVATAR.sales },
]

// Evenly spread points on a sphere (Fibonacci lattice), each linked to its three nearest neighbours.
// Agents take every few points so they are spread evenly too.
const N = 126
const POINTS: [number, number, number][] = Array.from({ length: N }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / N
  const r = Math.sqrt(1 - y * y)
  const th = i * 2.399963
  return [r * Math.cos(th), y, r * Math.sin(th)]
})
const EDGES: [number, number][] = (() => {
  const seen = new Set<string>()
  const edges: [number, number][] = []
  POINTS.forEach((p, i) => {
    POINTS.map((q, j) => [j, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2] as const)
      .filter(([j]) => j !== i)
      .sort((u, v) => u[1] - v[1])
      .slice(0, 3)
      .forEach(([j]) => {
        const key = i < j ? `${i}:${j}` : `${j}:${i}`
        if (!seen.has(key)) {
          seen.add(key)
          edges.push([i, j])
        }
      })
  })
  return edges
})()
const AGENT_AT = AGENTS.map((_, i) => Math.round(((i + 0.5) * N) / AGENTS.length))
const AGENT_SET = new Set(AGENT_AT)

const RADIUS = 38
const TILT = 0.32

function project([x, y, z]: [number, number, number], ry: number): [number, number, number] {
  const X = x * Math.cos(ry) + z * Math.sin(ry)
  const Z = -x * Math.sin(ry) + z * Math.cos(ry)
  const Y2 = y * Math.cos(TILT) - Z * Math.sin(TILT)
  const Z2 = y * Math.sin(TILT) + Z * Math.cos(TILT)
  return [50 + RADIUS * X, 50 - RADIUS * Y2, Z2]
}

const dot = (x: number, y: number, r: number) =>
  `M${(x - r).toFixed(2)},${y.toFixed(2)}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`

function frame(t: number) {
  const projected = POINTS.map((p) => project(p, t * 0.007))
  let edgesFront = ''
  let edgesBack = ''
  let nodesFront = ''
  let nodesBack = ''
  let spokes = ''
  let pulses = ''
  for (const [i, j] of EDGES) {
    const seg = `M${projected[i][0].toFixed(2)},${projected[i][1].toFixed(2)}L${projected[j][0].toFixed(2)},${projected[j][1].toFixed(2)}`
    if (projected[i][2] + projected[j][2] > 0) edgesFront += seg
    else edgesBack += seg
  }
  projected.forEach(([x, y, z], i) => {
    if (AGENT_SET.has(i)) return
    const r = Number((0.28 + (0.22 * (z + 1)) / 2).toFixed(2))
    if (z > 0) nodesFront += dot(x, y, r)
    else nodesBack += dot(x, y, r)
  })
  const chips = AGENTS.map((agent, i) => {
    const [x, y, z] = projected[AGENT_AT[i]]
    const depth = (z + 1) / 2
    if (z > -0.35) {
      spokes += `M50,50L${x.toFixed(2)},${y.toFixed(2)}`
      const s = (t * 0.014 + i * 0.29) % 1
      const u = i % 2 ? 1 - s : s
      pulses += dot(50 + (x - 50) * u, 50 + (y - 50) * u, 0.4)
    }
    return { agent, x, y, z, depth }
  })
  return { edgesFront, edgesBack, nodesFront, nodesBack, spokes, pulses, chips, ...cube(t * 0.007) }
}

// Hybro core: the logo's solid cube inside a wireframe cube, turning with the ball.
const CORNERS: [number, number, number][] = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]
const CUBE_EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
const FACES: { v: number[]; n: [number, number, number] }[] = [
  { v: [0, 1, 2, 3], n: [0, 0, -1] }, { v: [4, 5, 6, 7], n: [0, 0, 1] },
  { v: [0, 1, 5, 4], n: [0, -1, 0] }, { v: [3, 2, 6, 7], n: [0, 1, 0] },
  { v: [0, 3, 7, 4], n: [-1, 0, 0] }, { v: [1, 2, 6, 5], n: [1, 0, 0] },
]
const INNER = 0.09
const OUTER = 0.18

// Mix #2A6FD6 (shadow) toward #62F0FA (lit) by k.
function shade(k: number) {
  const a = [0x2a, 0x6f, 0xd6]
  const b = [0x62, 0xf0, 0xfa]
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('')
}

function cube(ry: number) {
  const inner = CORNERS.map(([a, b, c]) => project([a * INNER, b * INNER, c * INNER], ry))
  const outer = CORNERS.map(([a, b, c]) => project([a * OUTER, b * OUTER, c * OUTER], ry))
  const seg = (p: number[], q: number[]) => `M${p[0].toFixed(2)},${p[1].toFixed(2)}L${q[0].toFixed(2)},${q[1].toFixed(2)}`
  let frameFront = ''
  let frameBack = ''
  let links = ''
  let corners = ''
  for (const [i, j] of CUBE_EDGES) {
    if (outer[i][2] + outer[j][2] > 0) frameFront += seg(outer[i], outer[j])
    else frameBack += seg(outer[i], outer[j])
  }
  outer.forEach((p, i) => {
    links += seg(inner[i], p)
    corners += dot(p[0], p[1], Number((0.35 + 0.25 * (p[2] + 1)).toFixed(2)))
  })
  // Draw only the faces turned toward the viewer, lit from above.
  const faces = FACES.map((f) => {
    const [x, y, z] = f.n
    const Z = -x * Math.sin(ry) + z * Math.cos(ry)
    const ny = y * Math.cos(TILT) - Z * Math.sin(TILT)
    const nz = y * Math.sin(TILT) + Z * Math.cos(TILT)
    return { f, ny, nz }
  })
    .filter(({ nz }) => nz > 0)
    .map(({ f, ny, nz }) => ({
      d: 'M' + f.v.map((i) => `${inner[i][0].toFixed(2)},${inner[i][1].toFixed(2)}`).join('L') + 'Z',
      fill: shade(Math.max(0, Math.min(1, 0.35 + 0.55 * ny + 0.3 * nz))),
    }))
  const face = (i: number) => faces[i] ?? { d: '', fill: 'none' }
  return { frameFront, frameBack, links, corners, face0: face(0), face1: face(1), face2: face(2) }
}

function ChipIcon({ agent }: { agent: BallAgent }) {
  const box = { width: 20, height: 20, borderRadius: 6, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const
  if ('avatar' in agent) return <Avatar src={agent.avatar} size={20} />
  if ('logo' in agent) return <span style={box}><FrameworkLogo name={agent.logo} size={14} /></span>
  return <span style={box}><TextMark mark={agent.mark} color={agent.markColor} size={9} /></span>
}

type PathKey = 'edgesBack' | 'nodesBack' | 'spokes' | 'links' | 'frameBack' | 'frameFront' | 'corners' | 'edgesFront' | 'nodesFront' | 'pulses'
type FaceKey = 'face0' | 'face1' | 'face2'

const BACK_PATHS: { key: PathKey; props: React.SVGProps<SVGPathElement> }[] = [
  { key: 'edgesBack', props: { fill: 'none', stroke: '#3DBFCF', strokeOpacity: 0.1, strokeWidth: 0.14 } },
  { key: 'nodesBack', props: { fill: '#3DBFCF', fillOpacity: 0.25 } },
  { key: 'spokes', props: { fill: 'none', stroke: '#B385F0', strokeOpacity: 0.28, strokeWidth: 0.16 } },
  { key: 'links', props: { fill: 'none', stroke: '#7AD6E1', strokeOpacity: 0.45, strokeWidth: 0.22 } },
  { key: 'frameBack', props: { fill: 'none', stroke: '#3A82E1', strokeOpacity: 0.45, strokeWidth: 0.22 } },
]
const FACE_KEYS: FaceKey[] = ['face0', 'face1', 'face2']
const FRONT_PATHS: { key: PathKey; props: React.SVGProps<SVGPathElement> }[] = [
  { key: 'frameFront', props: { fill: 'none', stroke: '#4FD8E8', strokeOpacity: 0.9, strokeWidth: 0.26 } },
  { key: 'corners', props: { fill: '#7AE8F2' } },
  { key: 'edgesFront', props: { fill: 'none', stroke: '#3DBFCF', strokeOpacity: 0.38, strokeWidth: 0.18 } },
  { key: 'nodesFront', props: { fill: '#7AD6E1', fillOpacity: 0.9 } },
  { key: 'pulses', props: { fill: '#E3E6EB' } },
]

function chipStyle({ x, y, z, depth }: { x: number; y: number; z: number; depth: number }) {
  return {
    left: `${x.toFixed(2)}%`,
    top: `${y.toFixed(2)}%`,
    transform: `translate(-50%, -50%) scale(${(0.72 + 0.28 * depth).toFixed(3)})`,
    opacity: (z > 0 ? 0.6 + 0.4 * z : 0.12 + 0.4 * depth).toFixed(2),
    zIndex: String(Math.round(depth * 40)),
  }
}

const INITIAL = frame(0)

export function AgentBall() {
  const ref = useRef<HTMLDivElement>(null)
  const paths = useRef<Partial<Record<PathKey | FaceKey, SVGPathElement | null>>>({})
  const chips = useRef<(HTMLDivElement | null)[]>([])

  // Draw straight to the DOM on every display frame instead of re-rendering React.
  useFrameLoop(ref, (t) => {
    const f = frame(t)
    for (const { key } of [...BACK_PATHS, ...FRONT_PATHS]) paths.current[key]?.setAttribute('d', f[key])
    for (const key of FACE_KEYS) {
      paths.current[key]?.setAttribute('d', f[key].d)
      paths.current[key]?.setAttribute('fill', f[key].fill)
    }
    f.chips.forEach((chip, i) => {
      const el = chips.current[i]
      if (el) Object.assign(el.style, chipStyle(chip))
    })
  })

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`A network of agents joined to the Hybro core at the centre: ${AGENTS.map((a) => a.name).join(', ')}.`}
      style={{ position: 'relative', width: '100%', maxWidth: 820, aspectRatio: '1 / 1', margin: '24px auto 0' }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3DBFCF" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#3A82E1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3A82E1" stopOpacity="0" />
          </radialGradient>
        </defs>
        {BACK_PATHS.map(({ key, props }) => (
          <path key={key} ref={(el) => { paths.current[key] = el }} d={INITIAL[key]} {...props} />
        ))}
        <circle cx="50" cy="50" r="11" fill="url(#core-glow)" />
        {FACE_KEYS.map((key) => (
          <path key={key} ref={(el) => { paths.current[key] = el }} d={INITIAL[key].d} fill={INITIAL[key].fill} stroke="#9AF3FA" strokeOpacity={0.55} strokeWidth={0.18} strokeLinejoin="round" />
        ))}
        {FRONT_PATHS.map(({ key, props }) => (
          <path key={key} ref={(el) => { paths.current[key] = el }} d={INITIAL[key]} {...props} />
        ))}
      </svg>
      {INITIAL.chips.map((chip, i) => {
        const style = chipStyle(chip)
        return (
          <div
            key={chip.agent.name}
            ref={(el) => { chips.current[i] = el }}
            aria-hidden="true"
            className="ball-chip"
            style={{ ...style, opacity: Number(style.opacity), zIndex: Number(style.zIndex), willChange: 'transform, left, top' }}
          >
            <ChipIcon agent={chip.agent} />
            <span>{chip.agent.name}</span>
          </div>
        )
      })}
    </div>
  )
}
