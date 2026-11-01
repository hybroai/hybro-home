'use client'

import { useRef } from 'react'
import { useFrameLoop } from '../use-tick'
import { APP, GRAPH, GRAPH_H, GRAPH_W, NET_AGENTS, SUBNETS } from './app-data'

// The network topology from the app preview, one subnet lighting up at a time:
// its links flow, a pulse runs out to each online member, and every node
// drifts on its own slow orbit so the map keeps moving between bursts.

const CYCLE = 40
const TRAVEL = 24
// With reduced motion, and on first render: the first subnet lit, pulses arrived.
const STATIC_TICK = 32

const SUBNET_NODES = GRAPH.nodes.flatMap((n, i) => (n.kind === 'subnet' ? [i] : []))
const MAX_PULSES = Math.max(...SUBNETS.map((s) => NET_AGENTS.filter((a) => !a.offline && a.subnets.includes(s.id)).length))

const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const offlineAt = (i: number) => {
  const n = GRAPH.nodes[i]
  return n.kind === 'agent' && !!n.item.offline
}

/** Everything that moves, at time `rt` in 60 ms ticks. */
function frame(rt: number) {
  const t = Math.floor(rt)
  const eT = t % CYCLE
  const sub = Math.floor(t / CYCLE) % SUBNETS.length
  const active = SUBNET_NODES[sub]
  const lit = new Set([active])
  GRAPH.nodes.forEach((n, i) => {
    if (n.kind === 'agent' && n.item.subnets.includes(SUBNETS[sub].id)) lit.add(i)
  })
  const travel = Math.min(1, eT / TRAVEL)

  const pos = GRAPH.nodes.map((n, i) => {
    const amp = n.kind === 'subnet' ? 4 : 7
    return {
      x: n.x + Math.sin(rt * 0.045 + i * 1.7) * amp + Math.cos(rt * 0.028 + i * 0.9) * amp * 0.5,
      y: n.y + Math.cos(rt * 0.038 + i * 2.3) * amp + Math.sin(rt * 0.024 + i * 1.3) * amp * 0.5,
    }
  })

  const links = GRAPH.links.map(([i, j]) => {
    const on = i === active
    return {
      x1: pos[i].x.toFixed(1), y1: pos[i].y.toFixed(1), x2: pos[j].x.toFixed(1), y2: pos[j].y.toFixed(1),
      stroke: on ? APP.primary : APP.edge, width: on ? '1.5' : '1', opacity: on ? '1' : '0.5',
      dash: on ? '5 5' : 'none', offset: on ? (-rt * 0.8).toFixed(1) : '0',
    }
  })

  const p = ease(travel)
  const fade = travel < 1 ? 1 : Math.max(0, 1 - (eT - TRAVEL) / 8)
  const targets = GRAPH.links.filter(([i, j]) => i === active && !offlineAt(j))
  const pulses = Array.from({ length: MAX_PULSES }, (_, k) => {
    if (!targets[k]) return { x: '0', y: '0', opacity: '0' }
    const [i, j] = targets[k]
    return {
      x: (pos[i].x + (pos[j].x - pos[i].x) * p).toFixed(1),
      y: (pos[i].y + (pos[j].y - pos[i].y) * p).toFixed(1),
      opacity: fade.toFixed(2),
    }
  })

  const nodes = GRAPH.nodes.map((n, i) => {
    const subnet = n.kind === 'subnet'
    return {
      x: pos[i].x.toFixed(1), y: pos[i].y.toFixed(1), ly: (pos[i].y - (subnet ? 15 : 13)).toFixed(1),
      fill: subnet ? APP.primary : offlineAt(i) ? 'none' : lit.has(i) && travel >= 1 ? 'hsl(186 40% 72%)' : APP.agent,
      ring: i === active ? '1' : '0', opacity: lit.has(i) ? '1' : '0.35',
    }
  })

  const members = NET_AGENTS.filter((a) => a.subnets.includes(SUBNETS[sub].id))
  const label = { subnet: SUBNETS[sub].name, meta: `${members.length} agents · ${members.filter((m) => !m.offline).length} online` }
  return { links, pulses, nodes, label }
}

type Frame = ReturnType<typeof frame>
type Refs = {
  links: (SVGLineElement | null)[]
  pulses: (SVGCircleElement | null)[]
  rings: (SVGCircleElement | null)[]
  dots: (SVGCircleElement | null)[]
  texts: (SVGTextElement | null)[]
  groups: (SVGGElement | null)[]
  subnet: HTMLSpanElement | null
  meta: HTMLSpanElement | null
}

const set = (el: Element | null, attrs: Record<string, string>) => {
  if (el) for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
}

const INITIAL = frame(STATIC_TICK)

/** The topology view as the bottom of a feature card. */
export function Topology() {
  const box = useRef<HTMLDivElement>(null)
  const refs = useRef<Refs>({ links: [], pulses: [], rings: [], dots: [], texts: [], groups: [], subnet: null, meta: null })

  // Direct DOM updates on every display frame; React renders the first frame only.
  useFrameLoop(box, (rt) => {
    const next: Frame = frame(rt + STATIC_TICK)
    const r = refs.current
    next.links.forEach((l, i) => set(r.links[i], { x1: l.x1, y1: l.y1, x2: l.x2, y2: l.y2, stroke: l.stroke, 'stroke-width': l.width, opacity: l.opacity, 'stroke-dasharray': l.dash, 'stroke-dashoffset': l.offset }))
    next.pulses.forEach((pl, i) => set(r.pulses[i], { cx: pl.x, cy: pl.y, opacity: pl.opacity }))
    next.nodes.forEach((n, i) => {
      set(r.groups[i], { opacity: n.opacity })
      set(r.rings[i], { cx: n.x, cy: n.y, opacity: n.ring })
      set(r.dots[i], { cx: n.x, cy: n.y, fill: n.fill })
      set(r.texts[i], { x: n.x, y: n.ly })
    })
    if (r.subnet && r.subnet.textContent !== next.label.subnet) r.subnet.textContent = next.label.subnet
    if (r.meta && r.meta.textContent !== next.label.meta) r.meta.textContent = next.label.meta
  })

  return (
    <div className="feature-demo" style={{ background: APP.canvas, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '8px 14px', borderBottom: '1px solid #1F2228', background: '#15171C', fontSize: 12.5, color: '#8C929C' }}>
        <span style={{ color: '#E3E6EB', fontWeight: 500 }}>Network</span>
        <span aria-hidden="true" style={{ display: 'flex', gap: 4 }}>
          <span style={{ padding: '1px 9px', borderRadius: 6, background: APP.card, color: '#E3E6EB' }}>Topology</span>
          <span style={{ padding: '1px 9px' }}>Structure</span>
        </span>
      </div>
      <div ref={box} style={{ position: 'relative', height: 300 }}>
        <svg
          viewBox={`0 0 ${GRAPH_W} ${GRAPH_H}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          role="img"
          aria-label="Network topology. Subnets are teal, online agents grey, offline agents dashed. Each subnet lights up as its agents work."
        >
          {INITIAL.links.map((l, i) => (
            <line
              key={i}
              ref={(el) => { refs.current.links[i] = el }}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.stroke} strokeWidth={l.width} opacity={l.opacity}
              strokeDasharray={l.dash} strokeDashoffset={l.offset} strokeLinecap="round"
            />
          ))}
          {INITIAL.pulses.map((pl, i) => (
            <circle key={i} ref={(el) => { refs.current.pulses[i] = el }} cx={pl.x} cy={pl.y} r="3.5" fill="#7AD6E1" opacity={pl.opacity} />
          ))}
          {GRAPH.nodes.map((n, i) => {
            const subnet = n.kind === 'subnet'
            const offline = offlineAt(i)
            const at = INITIAL.nodes[i]
            return (
              <g key={n.item.name} ref={(el) => { refs.current.groups[i] = el }} opacity={at.opacity}>
                <circle ref={(el) => { refs.current.rings[i] = el }} cx={at.x} cy={at.y} r="11" fill="none" stroke={APP.primary} strokeWidth="2" opacity={at.ring} />
                <circle
                  ref={(el) => { refs.current.dots[i] = el }}
                  cx={at.x} cy={at.y} r={subnet ? 7 : 6} fill={at.fill}
                  stroke={offline ? 'hsl(215 12% 45%)' : 'none'} strokeWidth="1.5" strokeDasharray={offline ? '2 2' : undefined}
                />
                <text
                  ref={(el) => { refs.current.texts[i] = el }}
                  x={at.x} y={at.ly} textAnchor="middle"
                  fontSize={subnet ? 13 : 11.5} fontWeight={subnet ? 600 : 400}
                  fill="hsl(210 25% 86%)" stroke={APP.canvas} strokeWidth="4" paintOrder="stroke"
                >
                  {n.item.name}
                </text>
              </g>
            )
          })}
        </svg>
        <div aria-hidden="true" style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 10, border: `1px solid ${APP.border}`, background: APP.card, fontSize: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: APP.primary }} />
          <span ref={(el) => { refs.current.subnet = el }} style={{ color: '#E3E6EB', fontWeight: 500 }}>{INITIAL.label.subnet}</span>
          <span ref={(el) => { refs.current.meta = el }} style={{ color: APP.mutedFg }}>{INITIAL.label.meta}</span>
        </div>
      </div>
    </div>
  )
}
