// Tipos que descrevem as lições e os diagramas animados do explorador.

export type NodeKind = 'phone' | 'node' | 'gateway' | 'internet' | 'server' | 'router'

export type LinkKind = 'wifi' | 'mesh-l2' | 'babel-l3' | 'uplink' | 'ethernet'

export type PacketKind =
  | 'dhcp-request'
  | 'dhcp-reply'
  | 'data'
  | 'roam'
  | 'route'
  | 'sync'

export interface NodeSpec {
  id: string
  x: number
  y: number
  label: string
  sub?: string
  kind: NodeKind
  /** destaca o nó (anel de "pulso") */
  emphasis?: boolean
  /** cor de destaque opcional (ex.: identificar a nuvem) */
  tint?: string
}

export interface LinkSpec {
  id: string
  from: string
  to: string
  kind: LinkKind
  /** rótulo opcional mostrado no meio do enlace */
  label?: string
  /** força o enlace a ficar "animado" (fluxo) mesmo sem pacote */
  flow?: boolean
}

export interface CloudSpec {
  id: string
  /** ids dos nós que pertencem a esta nuvem (caixa tracejada) */
  nodeIds: string[]
  label: string
}

export interface PacketSpec {
  id: string
  /** sequência de ids de nós que o pacote percorre */
  route: string[]
  kind: PacketKind
  /** rótulo curto mostrado ao lado do pacote */
  label?: string
  /** tempo (ms) para percorrer cada salto */
  hopMs?: number
  /** atraso inicial (ms) para dessincronizar pacotes */
  offsetMs?: number
  /** se true, o pacote dá a volta e recomeça */
  loop?: boolean
  /** cor opcional (hex) */
  color?: string
}

export interface DiagramSpec {
  nodes: NodeSpec[]
  links: LinkSpec[]
  packets: PacketSpec[]
  clouds?: CloudSpec[]
}

export interface LegendItem {
  swatch: string
  label: string
}

export interface AdvancedBlock {
  title: string
  paragraphs: string[]
}

export interface LessonStep {
  id: string
  title: string
  /** texto introdutório/básico (parágrafos) */
  basic: string[]
  /** aprofundamento técnico, opcional */
  advanced?: AdvancedBlock[]
  diagram: DiagramSpec
  legend?: LegendItem[]
}

export interface Lesson {
  id: string
  order: number
  title: string
  subtitle: string
  blurb: string
  /** etiqueta (ex.: "Em breve", "Básico") */
  badge?: string
  available: boolean
  steps: LessonStep[]
}
