import type {
  CloudSpec,
  Lesson,
  LinkSpec,
  PacketSpec,
} from './types'

// ---------------------------------------------------------------- helpers

const link = (
  id: string,
  from: string,
  to: string,
  kind: LinkSpec['kind'],
  label?: string,
): LinkSpec => ({ id, from, to, kind, label })

const pkt = (
  id: string,
  route: string[],
  kind: PacketSpec['kind'],
  opts: Partial<PacketSpec> = {},
): PacketSpec => ({ id, route, kind, ...opts })

// ---------------------------------------------------------------- conteúdo

export const networkInterfaces: Lesson = {
  id: 'interfaces-de-rede',
  order: 4,
  title: 'As interfaces de rede',
  subtitle: 'Como um nó organiza rádios, portas e protocolos',
  blurb:
    'Um nó LibreMesh é uma pilha de interfaces: rádios Wi-Fi, portas com fio, interfaces mesh 802.11s, o AP dos clientes e os overlays batman-adv e Babel. Veja como tudo se encaixa.',
  available: true,
  steps: [
    // ------------------------------------------------------------ 1 (novo)
    {
      id: 'o-que-e-interface',
      title: 'O que é uma interface?',
      basic: [
        '“Interface de rede” é o nome técnico de qualquer porta por onde os dados entram e saem de um equipamento. Num roteador, algumas você consegue ver e tocar; outras são invisíveis, criadas por software.',
        'Olhe o roteador do diagrama: as entradas de cabo são as portas físicas com fio — as LAN (em cinza, para os aparelhos da casa) e a WAN (em verde, a saída para a internet). As antenas representam os rádios — as interfaces wireless (wlan0 e wlan1).',
        'Além delas, o próprio sistema cria interfaces virtuais — você nunca as vê fisicamente, mas são elas que fazem a rede mesh funcionar.',
      ],
      advanced: [
        {
          title: 'No Linux, tudo é interface',
          paragraphs: [
            'No Linux (base do OpenWrt), cada interface tem um nome — eth0, wlan0, br-lan… Você lista todas com o comando “ip link”.',
            'Uma porta física pode abrigar várias interfaces virtuais ao mesmo tempo: o rádio wlan0, por exemplo, carrega o wlan0-ap e o wlan0-mesh.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'phone', x: 150, y: 160, kind: 'phone', label: 'Celular', sub: 'sem fio' },
          { id: 'laptop', x: 150, y: 470, kind: 'node', label: 'Computador', sub: 'com cabo' },
          { id: 'router', x: 480, y: 300, kind: 'router', label: 'Seu roteador', sub: 'portas + rádios + virtuais', emphasis: true },
          { id: 'neighbor', x: 790, y: 180, kind: 'node', label: 'Nó vizinho', sub: 'via rádio mesh' },
        ],
        links: [
          link('l1', 'phone', 'router', 'wifi', 'wlan0 (rádio)'),
          link('l2', 'laptop', 'router', 'ethernet', 'porta LAN'),
          link('l3', 'router', 'neighbor', 'mesh-l2', 'wlan0-mesh'),
        ],
        packets: [pkt('p1', ['phone', 'router', 'neighbor'], 'data', { label: 'dados', hopMs: 900 })],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'interface wireless (rádio wlan0)' },
        { swatch: 'var(--c-eth)', label: 'porta LAN (cinza) — aparelhos da casa' },
        { swatch: 'var(--accent)', label: 'porta WAN (verde) — saída para a internet' },
        { swatch: 'var(--c-l2)', label: 'interface mesh (wlan0-mesh)' },
      ],
    },

    // ------------------------------------------------------------ 2 (novo)
    {
      id: 'fisicas-wireless-virtuais',
      title: 'Físicas, wireless e virtuais',
      basic: [
        'Podemos dividir as interfaces de um nó em três famílias:',
        'Físicas (com fio): as portas ethernet — LAN (para computadores e switch) e WAN (para a internet).',
        'Wireless (rádio): wlan0 e wlan1, as duas bandas (2,4 GHz e 5 GHz) ligadas às antenas.',
        'Virtuais (software): criadas pelo sistema em cima das anteriores — wlan0-ap, wlan0-mesh, bat0, br-lan…',
      ],
      advanced: [
        {
          title: 'O que “virtual” significa aqui',
          paragraphs: [
            'Uma interface virtual não existe fisicamente: o software “fatia” um rádio em vários usos (as VAPs, como wlan0-ap e wlan0-mesh) ou “junta” várias interfaces (bridges como br-lan, ou o bat0 do batman-adv).',
            'Por isso, um único rádio wlan0 aparece ao mesmo tempo como wlan0-ap, wlan0-mesh e ainda alimenta o bat0.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'lan', x: 120, y: 200, kind: 'server', label: 'LAN', sub: 'lan1–4 · com fio' },
          { id: 'wan', x: 120, y: 420, kind: 'server', label: 'WAN', sub: 'wan · internet' },
          { id: 'wlan0', x: 400, y: 200, kind: 'node', label: 'wlan0', sub: '2,4 GHz' },
          { id: 'wlan1', x: 400, y: 420, kind: 'node', label: 'wlan1', sub: '5 GHz' },
          { id: 'ap', x: 700, y: 130, kind: 'server', label: 'wlan0-ap', sub: 'AP dos clientes' },
          { id: 'mesh', x: 700, y: 260, kind: 'server', label: 'wlan0-mesh', sub: 'mesh 802.11s' },
          { id: 'bat0', x: 700, y: 390, kind: 'server', label: 'bat0', sub: 'batman-adv' },
          { id: 'brlan', x: 700, y: 510, kind: 'server', label: 'br-lan', sub: 'ponte local' },
        ],
        links: [],
        clouds: [
          { id: 'c1', nodeIds: ['lan', 'wan'], label: 'Físicas' } as CloudSpec,
          { id: 'c2', nodeIds: ['wlan0', 'wlan1'], label: 'Wireless' } as CloudSpec,
          { id: 'c3', nodeIds: ['ap', 'mesh', 'bat0', 'brlan'], label: 'Virtuais' } as CloudSpec,
        ],
        packets: [],
      },
    },

    // ------------------------------------------------------------ 3
    {
      id: 'esquema-de-nomes',
      title: 'O esquema de nomes',
      basic: [
        'O LibreMesh gera, para cada combinação de “interface física × protocolo”, uma interface lógica cujo nome segue o padrão:',
        'lm_net_<interface>_<protocolo>_if',
        'Por exemplo, o rádio wlan0 em modo mesh (wlan0-mesh) ganha uma interface para o batman-adv (…_batadv_if) e outra para o Babel (…_babeld_if). Um único rádio participa de vários protocolos ao mesmo tempo.',
      ],
      advanced: [
        {
          title: 'Protocolos padrão',
          paragraphs: [
            'Os protocolos configurados por padrão são: ieee80211s (o mesh), lan, anygw, babeld e batadv — cada um fornecido por um pacote lime-proto-<nome>.',
            'Os nomes completos ficam, por exemplo, lm_net_wlan0_mesh_batadv_if e lm_net_wlan0_mesh_babeld_if. Repare que o hífen vira underline no nome gerado.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'wlan0mesh', x: 290, y: 320, kind: 'node', label: 'wlan0-mesh', sub: '802.11s · rádio 2,4 GHz' },
          { id: 'batadv', x: 720, y: 180, kind: 'server', label: 'batadv', sub: 'lm_net_wlan0_mesh_batadv_if' },
          { id: 'babeld', x: 720, y: 460, kind: 'server', label: 'babeld', sub: 'lm_net_wlan0_mesh_babeld_if' },
        ],
        links: [
          link('l1', 'wlan0mesh', 'batadv', 'mesh-l2', 'batman-adv (L2)'),
          link('l2', 'wlan0mesh', 'babeld', 'babel-l3', 'Babel (L3)'),
        ],
        packets: [
          pkt('p1', ['wlan0mesh', 'batadv'], 'data', { label: 'camada 2', hopMs: 800 }),
          pkt('p2', ['wlan0mesh', 'babeld'], 'route', { label: 'camada 3', hopMs: 800, offsetMs: 900 }),
        ],
      },
      legend: [
        { swatch: 'var(--c-l2)', label: 'uma interface para o batman-adv' },
        { swatch: 'var(--c-l3)', label: 'outra para o Babel' },
      ],
    },

    // ------------------------------------------------------------ 4
    {
      id: 'interfaces-mesh',
      title: 'As interfaces mesh (802.11s)',
      basic: [
        'A ligação entre os nós usa o modo mesh do padrão IEEE 802.11s, que cria a interface wlan0-mesh (e wlan1-mesh no segundo rádio).',
        'É por essas interfaces que os nós se enxergam e repassam tráfego uns para os outros, formando a “malha” física da rede.',
        'No diagrama, as linhas entre os nós são esses enlaces de rádio mesh. Repare no pacote dando saltos pela malha.',
      ],
      advanced: [
        {
          title: 'O que o 802.11s faz',
          paragraphs: [
            'O 802.11s faz o encaminhamento em camada 2 entre os pontos de acesso mesh, sem precisar de um roteador central.',
            'Cada rádio pode ter uma interface mesh por banda: wlan0-mesh no 2,4 GHz e wlan1-mesh no 5 GHz.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'nA', x: 260, y: 160, kind: 'node', label: 'Nó A', sub: 'wlan0-mesh' },
          { id: 'nB', x: 470, y: 110, kind: 'node', label: 'Nó B', sub: 'wlan0-mesh' },
          { id: 'nC', x: 480, y: 300, kind: 'node', label: 'Nó C', sub: 'wlan0-mesh' },
          { id: 'nD', x: 260, y: 390, kind: 'node', label: 'Nó D', sub: 'wlan0-mesh' },
        ],
        links: [
          link('m1', 'nA', 'nB', 'mesh-l2'),
          link('m2', 'nA', 'nD', 'mesh-l2'),
          link('m3', 'nB', 'nC', 'mesh-l2'),
          link('m4', 'nC', 'nD', 'mesh-l2'),
        ],
        clouds: [
          { id: 'c1', nodeIds: ['nA', 'nB', 'nC', 'nD'], label: 'malha 802.11s (wlan0-mesh)' } as CloudSpec,
        ],
        packets: [pkt('p1', ['nA', 'nB', 'nC', 'nD', 'nA'], 'data', { label: 'dados', hopMs: 900 })],
      },
      legend: [{ swatch: 'var(--c-l2)', label: 'enlace de rádio mesh (802.11s)' }],
    },

    // ------------------------------------------------------------ 5
    {
      id: 'ap-dos-clientes',
      title: 'O AP para os clientes',
      basic: [
        'Ao mesmo tempo em que faz mesh, o rádio também abre um ponto de acesso para os clientes: a interface wlan0-ap (e wlan1-ap no 5 GHz).',
        'É por ela que celulares e notebooks se conectam, usando o SSID da sua rede (por exemplo, “RedeLivre”).',
        'No diagrama, o celular fala com o AP enquanto o mesmo nó continua ligado aos vizinhos pelo mesh — os dois modos rodam em paralelo no mesmo rádio.',
      ],
      advanced: [
        {
          title: 'Interfaces virtuais (VAPs)',
          paragraphs: [
            'Tudo isso roda em paralelo graças às interfaces virtuais (VAPs) do Wi-Fi: o mesmo rádio físico “wlan0” carrega o wlan0-mesh e o wlan0-ap.',
            'Além do AP visível, o LibreMesh costuma criar um AP “apname” (SSID oculto) usado para identificar e diagnosticar o nó.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'phone', x: 90, y: 200, kind: 'phone', label: 'Celular', sub: 'cliente' },
          { id: 'node', x: 380, y: 320, kind: 'node', label: 'Seu nó', sub: 'wlan0-ap · wlan0-mesh', emphasis: true },
          { id: 'neighbor', x: 700, y: 180, kind: 'node', label: 'Nó vizinho', sub: 'wlan0-mesh' },
        ],
        links: [
          link('l1', 'phone', 'node', 'wifi', 'wlan0-ap'),
          link('l2', 'node', 'neighbor', 'mesh-l2', 'wlan0-mesh'),
        ],
        packets: [pkt('p1', ['phone', 'node', 'neighbor'], 'data', { label: 'dados', hopMs: 900 })],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'AP (wlan0-ap) para os clientes' },
        { swatch: 'var(--c-l2)', label: 'mesh (wlan0-mesh) entre os nós' },
      ],
    },

    // ------------------------------------------------------------ 6
    {
      id: 'bat0-e-babel',
      title: 'batman-adv (bat0) e Babel por cima',
      basic: [
        'Por cima das interfaces mesh, o LibreMesh roda os dois protocolos de roteamento: o batman-adv (camada 2) e o Babel (camada 3).',
        'O batman-adv junta as interfaces mesh numa única interface lógica chamada bat0, que faz a nuvem parecer uma só LAN.',
        'O Babel roda em interfaces próprias (…_babeld_if) e cuida do roteamento entre nuvens até o gateway de internet.',
      ],
      advanced: [
        {
          title: 'bat0 na prática',
          paragraphs: [
            'bat0 é a interface lógica do batman-adv — é ela que aparece no sistema (por exemplo, no comando “ip link”).',
            'Como já vimos, batman-adv e Babel rodam em VLANs separadas: a VLAN do Babel é a mesma em toda a rede; a do batman-adv depende do identificador da nuvem.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'nA', x: 260, y: 150, kind: 'node', label: 'Nó A', sub: 'wlan0-mesh' },
          { id: 'nB', x: 470, y: 100, kind: 'node', label: 'Nó B', sub: 'wlan0-mesh' },
          { id: 'nC', x: 480, y: 300, kind: 'node', label: 'Nó C', sub: 'wlan0-mesh' },
          { id: 'nD', x: 260, y: 390, kind: 'node', label: 'Nó D', sub: 'wlan0-mesh' },
          { id: 'nE', x: 720, y: 200, kind: 'node', label: 'Nó E', sub: 'OutraVila' },
          { id: 'nF', x: 750, y: 410, kind: 'node', label: 'Nó F', sub: 'OutraVila' },
          { id: 'gw', x: 610, y: 520, kind: 'gateway', label: 'Gateway' },
          { id: 'internet', x: 900, y: 540, kind: 'internet', label: 'Internet' },
        ],
        links: [
          link('m1', 'nA', 'nB', 'mesh-l2'),
          link('m2', 'nA', 'nD', 'mesh-l2'),
          link('m3', 'nB', 'nC', 'mesh-l2'),
          link('m4', 'nC', 'nD', 'mesh-l2'),
          link('m5', 'nE', 'nF', 'mesh-l2'),
          link('b1', 'nC', 'nE', 'babel-l3'),
          link('b2', 'nC', 'gw', 'babel-l3'),
          link('b3', 'nE', 'gw', 'babel-l3'),
          link('up', 'gw', 'internet', 'uplink'),
        ],
        clouds: [
          { id: 'c1', nodeIds: ['nA', 'nB', 'nC', 'nD'], label: 'bat0 — nuvem “RedeLivre”' } as CloudSpec,
          { id: 'c2', nodeIds: ['nE', 'nF'], label: 'bat0 — nuvem “OutraVila”' } as CloudSpec,
        ],
        packets: [
          pkt('p1', ['nA', 'nB', 'nC'], 'data', { label: 'bat0 (L2)', hopMs: 900 }),
          pkt('p2', ['nC', 'nE', 'gw'], 'route', { label: 'Babel (L3)', hopMs: 1100, offsetMs: 1400 }),
        ],
      },
      legend: [
        { swatch: 'var(--c-l2)', label: 'batman-adv → interface bat0 (L2)' },
        { swatch: 'var(--c-l3)', label: 'Babel (L3)' },
        { swatch: 'var(--c-up)', label: 'saída para a internet' },
      ],
    },

    // ------------------------------------------------------------ 7
    {
      id: 'br-lan-e-anygw',
      title: 'br-lan, anygw e a zona LAN',
      basic: [
        'No final, tudo desemboca numa ponte chamada br-lan: ela junta as interfaces do batman-adv, do Babel e das portas com fio numa única rede local.',
        'É na br-lan que fica a interface anygw (lm_net_br_lan_anygw_if) — o “gateway qualquer” que dá o mesmo endereço de saída a todos os clientes da nuvem.',
        'O firewall do OpenWrt coloca todas essas interfaces na zona “lan”, e a porta de internet na zona “wan”. No diagrama, siga o pacote do celular até a internet.',
      ],
      advanced: [
        {
          title: 'A zona lan gerada',
          paragraphs: [
            'Exemplo de zona lan autogerada: lan, lm_net_br_lan_anygw_if, lm_net_wlan0_mesh_batadv_if, lm_net_wlan0_mesh_babeld_if, lm_net_lan1_batadv_if… e assim por diante, para cada porta e rádio.',
            'A zona wan mantém o padrão do OpenWrt (wan, wan6), com NAT (masq) e clamp de MTU.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'phone', x: 90, y: 190, kind: 'phone', label: 'Celular', sub: 'cliente' },
          { id: 'node', x: 330, y: 280, kind: 'node', label: 'Seu nó', sub: 'wlan0-ap · wlan0-mesh', emphasis: true },
          { id: 'brlan', x: 330, y: 470, kind: 'server', label: 'br-lan', sub: 'anygw' },
          { id: 'gw', x: 700, y: 300, kind: 'gateway', label: 'Gateway' },
          { id: 'internet', x: 880, y: 470, kind: 'internet', label: 'Internet' },
        ],
        links: [
          link('l1', 'phone', 'node', 'wifi', 'wlan0-ap'),
          link('l2', 'node', 'brlan', 'mesh-l2', 'L2'),
          link('l3', 'brlan', 'gw', 'babel-l3', 'Babel → gateway'),
          link('up', 'gw', 'internet', 'uplink'),
        ],
        packets: [pkt('p1', ['phone', 'node', 'brlan', 'gw', 'internet'], 'data', { label: 'dados', hopMs: 1000 })],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'AP (wlan0-ap)' },
        { swatch: 'var(--c-l2)', label: 'br-lan / anygw (L2)' },
        { swatch: 'var(--c-l3)', label: 'Babel até o gateway' },
        { swatch: 'var(--c-up)', label: 'internet' },
      ],
    },
  ],
}
