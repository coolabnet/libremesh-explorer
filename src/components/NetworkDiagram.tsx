import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CloudSpec,
  DiagramSpec,
  LinkKind,
  NodeKind,
  NodeSpec,
  PacketKind,
  PacketSpec,
} from '../lessons/types'

// ---------------------------------------------------------------- cores

const LINK_COLOR: Record<LinkKind, string> = {
  wifi: 'var(--c-wifi)',
  'mesh-l2': 'var(--c-l2)',
  'babel-l3': 'var(--c-l3)',
  uplink: 'var(--c-up)',
  ethernet: 'var(--c-eth)',
  relation: 'var(--c-rel)',
}

const LINK_DASH: Partial<Record<LinkKind, string>> = {
  'babel-l3': '7 7',
  relation: '6 6',
}

const PACKET_COLOR: Record<PacketKind, string> = {
  'dhcp-request': 'var(--c-dhcp-req)',
  'dhcp-reply': 'var(--c-dhcp-resp)',
  data: 'var(--c-data)',
  roam: 'var(--c-roam)',
  route: 'var(--c-l3)',
  sync: 'var(--c-sync)',
}

// ---------------------------------------------------------------- geometria

interface Pt {
  x: number
  y: number
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

interface RouteGeometry {
  pts: Pt[]
  segs: number[]
  total: number
}

function routeGeometry(route: string[], byId: Map<string, NodeSpec>): RouteGeometry {
  const pts = route.map((id) => {
    const n = byId.get(id)
    return { x: n?.x ?? 0, y: n?.y ?? 0 }
  })
  const segs: number[] = []
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const d = dist(pts[i], pts[i + 1])
    segs.push(d)
    total += d
  }
  return { pts, segs, total }
}

function pointAt(geo: RouteGeometry, d: number): Pt {
  let remaining = Math.max(0, d)
  for (let i = 0; i < geo.segs.length; i++) {
    if (remaining <= geo.segs[i]) {
      const a = geo.pts[i]
      const b = geo.pts[i + 1]
      const t = geo.segs[i] === 0 ? 0 : remaining / geo.segs[i]
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    }
    remaining -= geo.segs[i]
  }
  const last = geo.pts[geo.pts.length - 1]
  return { x: last.x, y: last.y }
}

// ---------------------------------------------------------------- animação

function useNow(playing: boolean): number {
  const [now, setNow] = useState(0)
  const raf = useRef<number>(0)
  const last = useRef<number>(0)

  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (t: number) => {
      setNow((n) => n + (t - last.current))
      last.current = t
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing])

  return now
}

// ---------------------------------------------------------------- ícones

function NodeGlyph({ kind }: { kind: NodeKind }) {
  const ink = 'var(--node-ink)'
  const common = {
    fill: 'none',
    stroke: ink,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (kind) {
    case 'phone':
      return (
        <g {...common}>
          <rect x={-8} y={-12} width={16} height={24} rx={4} />
          <line x1={-4} y1={8} x2={4} y2={8} />
        </g>
      )
    case 'gateway':
      return (
        <g {...common}>
          <rect x={-10} y={-7} width={20} height={16} rx={3} />
          <line x1={-3} y1={-3} x2={3} y2={-3} />
          <path d="M 0 -3 L 0 -9 M 0 -9 l -3 2 M 0 -9 l 3 2" />
        </g>
      )
    case 'internet':
      return (
        <g {...common}>
          <circle cx={-4} cy={1} r={5} />
          <circle cx={5} cy={-3} r={6} />
          <circle cx={4} cy={4} r={6} />
          <line x1={-12} y1={8} x2={12} y2={8} />
        </g>
      )
    case 'server':
      return (
        <g {...common}>
          <rect x={-9} y={-11} width={18} height={22} rx={3} />
          <line x1={-5} y1={-5} x2={5} y2={-5} />
          <line x1={-5} y1={0} x2={5} y2={0} />
          <line x1={-5} y1={5} x2={5} y2={5} />
        </g>
      )
    case 'node':
    default:
      return (
        <g {...common}>
          <rect x={-9} y={-6} width={18} height={14} rx={3.5} />
          <line x1={-5} y1={-6} x2={-5} y2={-13} />
          <line x1={5} y1={-6} x2={5} y2={-13} />
          <circle cx={-5} cy={-14} r={1.4} fill={ink} stroke="none" />
          <circle cx={5} cy={-14} r={1.4} fill={ink} stroke="none" />
        </g>
      )
  }
}

// ---------------------------------------------------------------- nó

function RouterNode({ node }: { node: NodeSpec }) {
  const W = 176
  const H = 64
  const ports = ['LAN1', 'LAN2', 'LAN3', 'LAN4', 'WAN']
  const pw = 22
  const gap = 8
  const start = -(ports.length * pw + (ports.length - 1) * gap) / 2 + pw / 2
  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      <line x1={-44} y1={-H / 2} x2={-52} y2={-H / 2 - 34} className="router-ant" />
      <circle cx={-52} cy={-H / 2 - 36} r={3.2} className="router-ant-tip" />
      <text x={-52} y={-H / 2 - 44} className="router-port-label" textAnchor="middle">
        wlan0
      </text>
      <line x1={44} y1={-H / 2} x2={52} y2={-H / 2 - 34} className="router-ant" />
      <circle cx={52} cy={-H / 2 - 36} r={3.2} className="router-ant-tip" />
      <text x={52} y={-H / 2 - 44} className="router-port-label" textAnchor="middle">
        wlan1
      </text>
      {node.emphasis && (
        <rect
          x={-W / 2 - 8}
          y={-H / 2 - 8}
          width={W + 16}
          height={H + 16}
          rx={14}
          className="router-emphasis"
        />
      )}
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={10} className="router-body" />
      {ports.map((p, i) => {
        const cx = start + i * (pw + gap)
        const isWan = p === 'WAN'
        return (
          <g key={p}>
            <rect
              x={cx - pw / 2}
              y={10}
              width={pw}
              height={14}
              rx={3}
              className={isWan ? 'router-port router-port-wan' : 'router-port'}
            />
            <text
              x={cx}
              y={44}
              className={isWan ? 'router-port-label router-port-label-wan' : 'router-port-label'}
              textAnchor="middle"
            >
              {p}
            </text>
          </g>
        )
      })}
      <text y={64} className="node-label" textAnchor="middle">
        {node.label}
      </text>
      {node.sub && (
        <text y={80} className="node-sub" textAnchor="middle">
          {node.sub}
        </text>
      )}
    </g>
  )
}

function DiagramNode({ node }: { node: NodeSpec }) {
  if (node.kind === 'router') return <RouterNode node={node} />
  return (
    <g transform={`translate(${node.x}, ${node.y})`}>
      {node.emphasis && <circle r={30} className="node-pulse" />}
      <circle r={24} className="node-badge" />
      <NodeGlyph kind={node.kind} />
      <text y={40} className="node-label" textAnchor="middle">
        {node.label}
      </text>
      {node.sub && (
        <text y={56} className="node-sub" textAnchor="middle">
          {node.sub}
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------- nuvem

function Cloud({ cloud, byId }: { cloud: CloudSpec; byId: Map<string, NodeSpec> }) {
  const xs = cloud.nodeIds.map((id) => byId.get(id)?.x ?? 0)
  const ys = cloud.nodeIds.map((id) => byId.get(id)?.y ?? 0)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const x = minX - 58
  const y = minY - 58
  const w = maxX - minX + 116
  const h = maxY - minY + 116
  const pillW = cloud.label.length * 6.6 + 28

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={26} className="cloud-box" />
      <rect x={x + 14} y={y - 11} width={pillW} height={22} rx={11} className="cloud-label-pill" />
      <text x={x + 14 + pillW / 2} y={y + 4} className="cloud-label" textAnchor="middle">
        {cloud.label}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------- enlace

function LinkLine({
  from,
  to,
  kind,
  active,
}: {
  from: Pt
  to: Pt
  kind: LinkKind
  active: boolean
}) {
  const color = LINK_COLOR[kind]
  const dash = LINK_DASH[kind]
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        style={{ stroke: color }}
        strokeDasharray={dash}
        className={kind === 'babel-l3' ? 'link-babel' : 'link'}
      />
      {active && (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          style={{ stroke: color }}
          strokeDasharray="2 12"
          className="link-flow"
        />
      )}
    </g>
  )
}

// ---------------------------------------------------------------- pacote

function PacketDot({ packet, pos }: { packet: PacketSpec; pos: Pt }) {
  const color = packet.color ?? PACKET_COLOR[packet.kind]
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      <circle r={7} style={{ fill: color }} className="packet" />
      {packet.label && (
        <text x={0} y={-14} className="packet-label" textAnchor="middle">
          {packet.label}
        </text>
      )}
    </g>
  )
}

// ---------------------------------------------------------------- diagrama

export default function NetworkDiagram({
  diagram,
  playing,
}: {
  diagram: DiagramSpec
  playing: boolean
}) {
  const now = useNow(playing)

  const byId = useMemo(() => {
    const m = new Map<string, NodeSpec>()
    diagram.nodes.forEach((n) => m.set(n.id, n))
    return m
  }, [diagram.nodes])

  // enlaces ativos = usados por algum pacote (para o efeito de fluxo)
  const activeLinks = useMemo(() => {
    const s = new Set<string>()
    for (const p of diagram.packets) {
      for (let i = 0; i < p.route.length - 1; i++) {
        s.add(`${p.route[i]}|${p.route[i + 1]}`)
      }
    }
    return s
  }, [diagram.packets])

  const positions = diagram.packets.map((p) => {
    const geo = routeGeometry(p.route, byId)
    if (geo.total === 0 || p.route.length < 2) return geo.pts[0]
    const hops = p.route.length - 1
    const hopMs = p.hopMs ?? 1000
    const totalMs = hopMs * hops
    const t = Math.max(0, now - (p.offsetMs ?? 0))
    const progress = p.loop === false ? Math.min(t, totalMs) : t % totalMs
    return pointAt(geo, geo.total * (progress / totalMs))
  })

  return (
    <svg
      viewBox="0 0 1000 640"
      className="diagram"
      role="img"
      aria-label="Diagrama animado da rede mesh"
    >
      <defs>
        <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" className="dot" />
        </pattern>
      </defs>

      <rect width="1000" height="640" className="diagram-bg" />
      <rect width="1000" height="640" fill="url(#dots)" />

      {diagram.clouds?.map((c) => (
        <Cloud key={c.id} cloud={c} byId={byId} />
      ))}

      {diagram.links.map((l) => {
        const from = byId.get(l.from)
        const to = byId.get(l.to)
        if (!from || !to) return null
        const active =
          l.flow === true ||
          activeLinks.has(`${l.from}|${l.to}`) ||
          activeLinks.has(`${l.to}|${l.from}`)
        return (
          <LinkLine
            key={l.id}
            from={{ x: from.x, y: from.y }}
            to={{ x: to.x, y: to.y }}
            kind={l.kind}
            active={active}
          />
        )
      })}

      {diagram.nodes.map((n) => (
        <DiagramNode key={n.id} node={n} />
      ))}

      {diagram.packets.map((p, i) => (
        <PacketDot key={p.id} packet={p} pos={positions[i]} />
      ))}
    </svg>
  )
}
