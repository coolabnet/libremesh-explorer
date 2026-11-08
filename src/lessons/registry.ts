import type { Lesson } from './types'
import { clientToInternet } from './client-to-internet'
import { networkInterfaces } from './network-interfaces'
import { whyLibreMesh } from './why-libremesh'

// Lições futuras ficam aqui, já listadas na home com "Em breve".
const upcoming = (order: number, id: string, title: string, blurb: string): Lesson => ({
  id,
  order,
  title,
  subtitle: 'Em breve',
  blurb,
  badge: 'Em breve',
  available: false,
  steps: [],
})

export const lessons: Lesson[] = [
  whyLibreMesh,
  clientToInternet,
  networkInterfaces,
  upcoming(
    2,
    'autoconfiguracao',
    'Autoconfiguração e shared-state',
    'Como um nó novo liga e se integra sozinho à rede, e como os dados são sincronizados pela mesh.',
  ),
  upcoming(
    3,
    'pirania',
    'Pirania: portal cativo e vouchers',
    'Como o LibreMesh controla o acesso à rede comunitária por meio de vouchers.',
  ),
]

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id)
}
