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

export const whyLibreMesh: Lesson = {
  id: 'por-que-libremesh',
  order: 0,
  title: 'Por que o LibreMesh?',
  subtitle: 'Do firmware fechado à rede livre e comunitária',
  blurb:
    'Entenda por que firmwares proprietários limitam o seu roteador, como o OpenWrt devolve o controle para você e o que o LibreMesh acrescenta para criar redes livres e comunitárias.',
  available: true,
  steps: [
    // ------------------------------------------------------------ 1
    {
      id: 'o-que-e-firmware',
      title: 'O que é um firmware?',
      basic: [
        'Firmware é o sistema operacional embutido dentro do roteador — como o sistema do seu celular ou computador, só que feito para aparelhos pequenos e dedicados.',
        'Ele decide tudo o que o roteador pode ou não fazer: quais funções existem, como ele se conecta, o que você consegue configurar (e o que não consegue).',
        'Todo roteador sai de fábrica com um firmware. A pergunta que importa é: esse firmware está do seu lado?',
      ],
      advanced: [
        {
          title: 'Por baixo do capô',
          paragraphs: [
            'Tecnicamente, o firmware de um roteador é um sistema (geralmente Linux) compilado para o chip do aparelho, com os drivers e os serviços de rede.',
            'O OpenWrt é exatamente isso — um Linux para roteadores — mas distribuído como software livre.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'phone', x: 150, y: 300, kind: 'phone', label: 'Você', sub: 'quem usa' },
          { id: 'router', x: 480, y: 300, kind: 'router', label: 'Seu roteador', sub: 'o firmware roda aqui', emphasis: true },
          { id: 'internet', x: 820, y: 300, kind: 'internet', label: 'Internet' },
        ],
        links: [
          link('l1', 'phone', 'router', 'wifi', 'Wi-Fi'),
          link('l2', 'router', 'internet', 'uplink', 'saída'),
        ],
        packets: [pkt('p1', ['phone', 'router', 'internet'], 'data', { label: 'dados', hopMs: 900 })],
      },
      legend: [{ swatch: 'var(--c-up)', label: 'o roteador é a porta entre você e a internet' }],
    },

    // ------------------------------------------------------------ 2
    {
      id: 'problema-proprietario',
      title: 'O problema do firmware proprietário',
      basic: [
        'O firmware que vem de fábrica costuma ser proprietário: o código é fechado, você não pode ver o que ele faz nem modificá-lo.',
        'As funções são exatamente as que o fabricante escolheu — e nada mais. Se a sua comunidade precisa de algo diferente, não dá para adaptar.',
        'Quando o fabricante decide parar de atualizar (o que acontece com muitos roteadores baratos), o aparelho fica com falhas de segurança conhecidas e vira lixo eletrônico — mesmo ainda funcionando.',
        'No fim, o aparelho é seu, mas quem manda nele é o fabricante.',
      ],
      advanced: [
        {
          title: 'Obsolescência e privacidade',
          paragraphs: [
            'A obsolescência programada aparece quando o fabricante deixa de lançar correções de segurança para forçar a troca do aparelho. Sem atualizações, um roteador exposto à internet é um risco real para toda a sua rede.',
            'Há também a questão da privacidade: alguns firmwares enviam dados de uso para o fabricante sem avisar direito.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'router', x: 480, y: 320, kind: 'router', label: 'Seu roteador', sub: 'firmware fechado' },
          { id: 'vendor', x: 760, y: 140, kind: 'server', label: 'Fabricante', sub: 'controla o código' },
          { id: 'phone', x: 150, y: 200, kind: 'phone', label: 'Você', sub: 'não pode mudar' },
        ],
        links: [
          link('l1', 'vendor', 'router', 'relation', 'controla'),
          link('l2', 'phone', 'router', 'wifi', 'só usa'),
        ],
        packets: [],
      },
      legend: [
        { swatch: 'var(--c-rel)', label: 'quem controla o aparelho' },
        { swatch: 'var(--c-wifi)', label: 'quem apenas usa' },
      ],
    },

    // ------------------------------------------------------------ 3
    {
      id: 'openwrt',
      title: 'OpenWrt: liberte o seu roteador',
      basic: [
        'O OpenWrt é um sistema operacional livre (Linux) para roteadores. Ele substitui o firmware de fábrica e devolve o controle para você.',
        'O código é aberto: qualquer pessoa pode ver, auditar, modificar e melhorar. A comunidade mantém o projeto e lança atualizações de segurança por muitos anos.',
        'Com ele, um roteador “velho” ganha vida nova: novas funções via pacotes, servidor, VPN… e deixa de ser descartável.',
      ],
      advanced: [
        {
          title: 'Um ecossistema inteiro',
          paragraphs: [
            'O OpenWrt tem milhares de pacotes instaláveis, um gerenciador próprio e suporte a centenas de aparelhos.',
            'É a base de muitos projetos de rede comunitária e até de empresas — inclusive do LibreMesh.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'router', x: 480, y: 320, kind: 'router', label: 'Seu roteador', sub: 'OpenWrt · código aberto', emphasis: true },
          { id: 'community', x: 760, y: 140, kind: 'server', label: 'Comunidade', sub: 'desenvolve e mantém' },
          { id: 'phone', x: 150, y: 200, kind: 'phone', label: 'Você', sub: 'pode ver e mudar' },
        ],
        links: [
          link('l1', 'community', 'router', 'relation', 'código aberto'),
          link('l2', 'phone', 'router', 'wifi', 'usa e contribui'),
        ],
        packets: [pkt('p1', ['phone', 'router', 'community'], 'sync', { label: 'colaboração', hopMs: 1100 })],
      },
      legend: [
        { swatch: 'var(--c-rel)', label: 'código aberto, mantido pela comunidade' },
        { swatch: 'var(--c-sync)', label: 'você também pode contribuir' },
      ],
    },

    // ------------------------------------------------------------ 4
    {
      id: 'particularidade-libremesh',
      title: 'O que o LibreMesh acrescenta',
      basic: [
        'O OpenWrt liberta o aparelho, mas não transforma roteadores em uma rede mesh sozinho. É aí que entra o LibreMesh.',
        'O LibreMesh é um conjunto de pacotes sobre o OpenWrt que faz o nó se auto-configurar e se juntar aos vizinhos: você liga o roteador e ele passa a fazer parte da rede comunitária, sem precisar ser especialista.',
        'Suas particularidades: arquitetura em duas camadas (batman-adv + Babel), interface web no celular (lime-app), portal cativo com vouchers (Pirania) e uma única imagem de firmware para todos os nós da rede.',
      ],
      advanced: [
        {
          title: 'Feito por e para comunidades',
          paragraphs: [
            'O LibreMesh nasceu de redes comunitárias (Coolab, AlterMundi, Freifunk, Guifi, entre outras) e é mantido por elas. O objetivo declarado é permitir que pessoas não-especialistas montem e gerenciem a própria rede.',
            'Os detalhes técnicos — batman-adv, Babel, anygw, shared-state — você vai ver nas próximas lições.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'nA', x: 260, y: 150, kind: 'node', label: 'Nó A', sub: 'LibreMesh' },
          { id: 'nB', x: 470, y: 100, kind: 'node', label: 'Nó B', sub: 'LibreMesh' },
          { id: 'nC', x: 480, y: 300, kind: 'node', label: 'Nó C', sub: 'LibreMesh' },
          { id: 'nD', x: 260, y: 390, kind: 'node', label: 'Nó D', sub: 'LibreMesh' },
          { id: 'gw', x: 640, y: 480, kind: 'gateway', label: 'Gateway' },
          { id: 'internet', x: 900, y: 520, kind: 'internet', label: 'Internet' },
        ],
        links: [
          link('m1', 'nA', 'nB', 'mesh-l2'),
          link('m2', 'nA', 'nD', 'mesh-l2'),
          link('m3', 'nB', 'nC', 'mesh-l2'),
          link('m4', 'nC', 'nD', 'mesh-l2'),
          link('b1', 'nC', 'gw', 'babel-l3'),
          link('up', 'gw', 'internet', 'uplink'),
        ],
        clouds: [
          { id: 'c1', nodeIds: ['nA', 'nB', 'nC', 'nD'], label: 'LibreMesh sobre OpenWrt' } as CloudSpec,
        ],
        packets: [pkt('p1', ['nA', 'nB', 'nC', 'gw', 'internet'], 'data', { label: 'dados', hopMs: 1000 })],
      },
      legend: [
        { swatch: 'var(--c-l2)', label: 'mesh entre nós (batman-adv)' },
        { swatch: 'var(--c-l3)', label: 'roteamento até o gateway (Babel)' },
      ],
    },

    // ------------------------------------------------------------ 5
    {
      id: 'resumo',
      title: 'Livre, aberto e comunitário',
      basic: [
        'Resumindo o caminho: firmware fechado (limita) → OpenWrt (liberta o aparelho) → LibreMesh (conecta aparelhos livres em rede comunitária).',
        'Uma rede livre é: aberta (qualquer um pode se juntar, se houver alcance), neutra (não discrimina a origem ou o destino dos dados) e livre (software livre, controlada por quem a usa).',
        'Nas próximas lições, você vai ver exatamente como um pacote atravessa essa rede — e como cada peça funciona por dentro.',
      ],
      advanced: [
        {
          title: 'Os três princípios',
          paragraphs: [
            'O LibreMesh se baseia em: rede aberta, rede neutra e software livre (AGPL) — para que ninguém possa fechar o que pertence à comunidade.',
            'Continue na lição 1: “Do cliente à internet”.',
          ],
        },
      ],
      diagram: {
        nodes: [
          { id: 'phone', x: 90, y: 200, kind: 'phone', label: 'Você', sub: 'cliente' },
          { id: 'nA', x: 300, y: 150, kind: 'node', label: 'Nó A', sub: 'LibreMesh' },
          { id: 'nC', x: 460, y: 320, kind: 'node', label: 'Nó C', sub: 'LibreMesh' },
          { id: 'gw', x: 660, y: 300, kind: 'gateway', label: 'Gateway' },
          { id: 'internet', x: 880, y: 300, kind: 'internet', label: 'Internet' },
        ],
        links: [
          link('l1', 'phone', 'nA', 'wifi'),
          link('l2', 'nA', 'nC', 'mesh-l2'),
          link('l3', 'nC', 'gw', 'babel-l3'),
          link('up', 'gw', 'internet', 'uplink'),
        ],
        packets: [pkt('p1', ['phone', 'nA', 'nC', 'gw', 'internet'], 'data', { label: 'sua rede', hopMs: 1000 })],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'você entra na rede' },
        { swatch: 'var(--c-l2)', label: 'a malha (batman-adv)' },
        { swatch: 'var(--c-l3)', label: 'o caminho até a internet (Babel)' },
      ],
    },
  ],
}
