import type {
  CloudSpec,
  Lesson,
  LinkSpec,
  NodeSpec,
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

// Posições fixas no sistema de coordenadas do SVG (viewBox 1000×640).
const P = {
  phone: { x: 96, y: 300 },
  nA: { x: 260, y: 150 },
  nB: { x: 470, y: 100 },
  nC: { x: 480, y: 300 },
  nD: { x: 260, y: 390 },
  nE: { x: 720, y: 200 },
  nF: { x: 750, y: 410 },
  gw: { x: 610, y: 520 },
  internet: { x: 900, y: 540 },
}

const phone = (y = P.phone.y, x = P.phone.x): NodeSpec => ({
  id: 'phone',
  x,
  y,
  kind: 'phone',
  label: 'Seu celular',
  sub: 'cliente',
})

const nA: NodeSpec = { id: 'nA', x: P.nA.x, y: P.nA.y, kind: 'node', label: 'Nó A', sub: 'AP · RedeLivre' }
const nB: NodeSpec = { id: 'nB', x: P.nB.x, y: P.nB.y, kind: 'node', label: 'Nó B', sub: 'AP · RedeLivre' }
const nC: NodeSpec = { id: 'nC', x: P.nC.x, y: P.nC.y, kind: 'node', label: 'Nó C', sub: 'retransmissor' }
const nD: NodeSpec = { id: 'nD', x: P.nD.x, y: P.nD.y, kind: 'node', label: 'Nó D', sub: 'retransmissor' }
const nE: NodeSpec = { id: 'nE', x: P.nE.x, y: P.nE.y, kind: 'node', label: 'Nó E', sub: 'OutraVila' }
const nF: NodeSpec = { id: 'nF', x: P.nF.x, y: P.nF.y, kind: 'node', label: 'Nó F', sub: 'OutraVila' }
const gw: NodeSpec = { id: 'gw', x: P.gw.x, y: P.gw.y, kind: 'gateway', label: 'Gateway', sub: 'saída p/ internet' }
const internet: NodeSpec = { id: 'internet', x: P.internet.x, y: P.internet.y, kind: 'internet', label: 'Internet' }

const cloudA: CloudSpec = {
  id: 'cloudA',
  nodeIds: ['nA', 'nB', 'nC', 'nD'],
  label: 'Nuvem “RedeLivre” — camada 2 (batman-adv)',
}

const cloudB: CloudSpec = {
  id: 'cloudB',
  nodeIds: ['nE', 'nF'],
  label: 'Nuvem “OutraVila”',
}

// Enlaces de camada 2 dentro da nuvem RedeLivre.
const meshA: LinkSpec[] = [
  link('mA1', 'nA', 'nB', 'mesh-l2'),
  link('mA2', 'nA', 'nD', 'mesh-l2'),
  link('mA3', 'nB', 'nC', 'mesh-l2'),
  link('mA4', 'nC', 'nD', 'mesh-l2'),
]

// ---------------------------------------------------------------- conteúdo

export const clientToInternet: Lesson = {
  id: 'cliente-ate-a-internet',
  order: 1,
  title: 'Do cliente à internet',
  subtitle: 'A viagem de um pacote por uma rede mesh LibreMesh',
  blurb:
    'Veja um celular se conectar a um nó, atravessar a camada 2 (batman-adv), ser roteado pela camada 3 (Babel) e chegar à internet — passo a passo e animado.',
  available: true,
  steps: [
    // ------------------------------------------------------------ 1
    {
      id: 'o-que-e-mesh',
      title: 'O que é uma rede mesh',
      basic: [
        'Uma rede mesh é uma rede em que todos os participantes — os “nós” — conseguem rotear o tráfego uns dos outros. Não existe um ponto central: a topologia pode ser totalmente livre e, normalmente, é montada e mantida pelas próprias pessoas que a usam.',
        'Cada nó costuma ser um roteador com o firmware LibreMesh instalado. Ele conversa com seus vizinhos por Wi-Fi e repassa os dados de quem está mais longe, salto a salto (hop).',
        'No diagrama, cada círculo é um nó e cada linha é um enlace de rádio entre vizinhos. Repare no pacote “dados” dando vários saltos pela rede.',
      ],
      advanced: [
        {
          title: 'Por que não uma rede “estrela”?',
          paragraphs: [
            'Na rede doméstica comum, todos os aparelhos falam com um único roteador central (topologia estrela). Se ele cai, tudo cai. Na mesh, a responsabilidade de rotear é distribuída: se um nó falha, o tráfego procura outro caminho automaticamente.',
          ],
        },
        {
          title: 'De onde vem o LibreMesh?',
          paragraphs: [
            'O LibreMesh é um conjunto de pacotes sobre o OpenWrt (um Linux enxuto para roteadores). O objetivo é permitir que uma rede comunitária seja montada sem precisar de um especialista em redes.',
            'Vocabulário: cada aparelho é um “nó” (node). Vizinhos são os nós que se enxergam diretamente pelo rádio, sem intermediários.',
          ],
        },
      ],
      diagram: {
        nodes: [nA, nB, nC, nD],
        links: meshA,
        clouds: [cloudA],
        packets: [
          pkt('p1', ['nA', 'nB', 'nC', 'nD', 'nA'], 'data', {
            label: 'dados',
            hopMs: 900,
          }),
        ],
      },
      legend: [{ swatch: 'var(--c-l2)', label: 'enlace de rádio entre nós (salto)' }],
    },

    // ------------------------------------------------------------ 2
    {
      id: 'duas-camadas',
      title: 'As duas camadas do LibreMesh',
      basic: [
        'O LibreMesh organiza a rede em duas camadas que trabalham juntas: uma camada 2 local (a “nuvem”) e uma camada 3 global (o roteamento).',
        'Camada 2 — a nuvem: usa o protocolo batman-adv. Ele transforma vários nós e vários saltos em uma única rede local (LAN). Para os aparelhos conectados, tudo parece um único cabo de rede.',
        'Camada 3 — o roteamento: usa o protocolo Babel. Ele conecta nuvens diferentes e escolhe o melhor caminho até o gateway que tem saída para a internet.',
      ],
      advanced: [
        {
          title: 'batman-adv roda no kernel',
          paragraphs: [
            'O B.A.T.M.A.N. Advanced é um protocolo de roteamento mesh que roda no espaço do kernel. Mesmo com muitos nós e saltos, ele abstrai a topologia para um único domínio de broadcast de camada 2. É isso que permite o roaming: você troca de ponto de acesso sem perder a conexão TCP/UDP.',
          ],
        },
        {
          title: 'Babel e as VLANs',
          paragraphs: [
            'O Babel é um protocolo de roteamento robusto para redes sem fio e com fio. Por padrão, todos os nós rodam Babel e batman-adv, mas em VLANs separadas. A VLAN do Babel é a mesma para toda a rede; a VLAN do batman-adv depende de um identificador da “nuvem”.',
          ],
        },
      ],
      diagram: {
        nodes: [nA, nB, nC, nD, nE, nF, gw, internet],
        links: [
          ...meshA,
          link('bB1', 'nE', 'nF', 'mesh-l2'),
          link('l3a', 'nC', 'nE', 'babel-l3'),
          link('l3b', 'nD', 'nF', 'babel-l3'),
          link('l3c', 'nC', 'gw', 'babel-l3'),
          link('l3d', 'nE', 'gw', 'babel-l3'),
          link('up1', 'gw', 'internet', 'uplink'),
        ],
        clouds: [cloudA, cloudB],
        packets: [
          pkt('p-l2', ['nA', 'nB', 'nC'], 'data', { label: 'camada 2', hopMs: 900 }),
          pkt('p-l3', ['nC', 'nE'], 'route', { label: 'Babel (L3)', hopMs: 1100, offsetMs: 1400 }),
          pkt('p-up', ['gw', 'internet'], 'data', { label: '→ internet', hopMs: 1100, offsetMs: 2600 }),
        ],
      },
      legend: [
        { swatch: 'var(--c-l2)', label: 'camada 2 — batman-adv (nuvem/LAN)' },
        { swatch: 'var(--c-l3)', label: 'camada 3 — Babel (roteamento)' },
        { swatch: 'var(--c-up)', label: 'saída para a internet' },
      ],
    },

    // ------------------------------------------------------------ 3
    {
      id: 'celular-entra',
      title: 'O celular entra na rede',
      basic: [
        'Quando o seu celular procura uma rede Wi-Fi, ele vê o SSID da nuvem (por exemplo, “RedeLivre”). Ao se conectar, ele pede um endereço IP para um servidor DHCP.',
        'O truque do LibreMesh: todos os pontos de acesso da mesma nuvem usam o mesmo SSID, o mesmo endereço de gateway e até o mesmo MAC “anycast”. Assim, não importa em qual nó você se conecta — a rede parece a mesma.',
        'No diagrama, veja o celular pedir um IP (DHCP) e receber a resposta do próprio nó onde se associou.',
      ],
      advanced: [
        {
          title: 'Endereços anycast',
          paragraphs: [
            '“Anycast” é um endereço compartilhado por vários dispositivos ao mesmo tempo. Na nuvem, o IP e o MAC do gateway são anycast: do ponto de vista do cliente, o gateway é sempre o mesmo, mesmo trocando de nó físico.',
          ],
        },
        {
          title: 'DHCP sem colisão',
          paragraphs: [
            'A tabela de concessões (leases) do DHCP é sincronizada entre os nós da nuvem por meio do shared-state, para que dois nós não entreguem o mesmo IP a clientes diferentes.',
          ],
        },
      ],
      diagram: {
        nodes: [phone(), nA, nB, nC, nD],
        links: [link('w1', 'phone', 'nA', 'wifi', 'Wi-Fi (AP)'), ...meshA],
        clouds: [cloudA],
        packets: [
          pkt('dhcp-req', ['phone', 'nA'], 'dhcp-request', {
            label: 'DHCP: quero um IP',
            hopMs: 700,
          }),
          pkt('dhcp-resp', ['nA', 'phone'], 'dhcp-reply', {
            label: 'aqui está seu IP',
            hopMs: 700,
            offsetMs: 1000,
          }),
        ],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'associação Wi-Fi com o ponto de acesso' },
        { swatch: 'var(--c-dhcp-req)', label: 'pedido de IP (DHCP)' },
        { swatch: 'var(--c-dhcp-resp)', label: 'resposta com o IP' },
      ],
    },

    // ------------------------------------------------------------ 4
    {
      id: 'dentro-da-nuvem',
      title: 'Dentro da nuvem (camada 2)',
      basic: [
        'Enquanto você se move, o celular pode trocar de ponto de acesso dentro da mesma nuvem sem perder a conexão. Isso se chama roaming.',
        'É o batman-adv que faz a mágica: para o seu aparelho, a nuvem inteira é uma única rede local, então a troca de nó fica invisível. A sessão (chamada de vídeo, streaming…) continua de pé.',
        'No diagrama, o celular se associou ao Nó B (o AP anterior era o Nó A) e o pacote continua percorrendo a nuvem normalmente.',
      ],
      advanced: [
        {
          title: 'Por que a sessão não cai',
          paragraphs: [
            'Como o MAC e o IP do gateway são anycast, o cliente nem percebe que o ponto de acesso físico mudou. Ele continua falando com “o mesmo” gateway.',
            'Uma regra de nftables impede que pacotes enviados ao endereço anycast se propaguem pela nuvem: apenas o nó onde o cliente está associado responde.',
          ],
        },
      ],
      diagram: {
        nodes: [
          phone(P.nB.y - 40, 110),
          { ...nA, sub: 'AP anterior' },
          { ...nB, sub: 'AP atual · roaming' },
          nC,
          nD,
        ],
        links: [
          link('w2', 'phone', 'nB', 'wifi', 'Wi-Fi (AP)'),
          ...meshA,
        ],
        clouds: [cloudA],
        packets: [
          pkt('roam-data', ['phone', 'nB', 'nC', 'nD'], 'data', {
            label: 'sessão continua',
            hopMs: 850,
          }),
        ],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'associação atual com o novo AP' },
        { swatch: 'var(--c-l2)', label: 'a sessão atravessa a nuvem sem cair' },
      ],
    },

    // ------------------------------------------------------------ 5
    {
      id: 'saindo-para-internet',
      title: 'Saindo para a internet (camada 3)',
      basic: [
        'Quando você abre um site, o pacote precisa sair da nuvem e chegar à internet. É aqui que entra o Babel.',
        'O nó onde você está associado recebe o pacote e o encaminha para o endereço anycast do gateway. Em seguida, o Babel roteia o pacote pela rede — que pode atravessar outras nuvens — até o gateway mais próximo com saída para a internet.',
        'Acompanhe o pacote fazendo o caminho completo: celular → nó → rede mesh → gateway → internet.',
      ],
      advanced: [
        {
          title: 'Roteamento dinâmico',
          paragraphs: [
            'O Babel calcula continuamente o melhor caminho e recalcula quando um enlace cai. Se a rota pelo Nó E falhar, ele usa outra rota até o gateway.',
          ],
        },
        {
          title: 'Gateway inteligente e com redundância',
          paragraphs: [
            'O gateway é escolhido por métrica (o “mais próximo” em custo de rota), e pode haver mais de um gateway — o que dá redundância à saída para a internet.',
          ],
        },
      ],
      diagram: {
        nodes: [phone(), nA, nB, nC, nD, nE, nF, gw, internet],
        links: [
          link('w3', 'phone', 'nA', 'wifi'),
          ...meshA,
          link('bB2', 'nE', 'nF', 'mesh-l2'),
          link('l3x', 'nC', 'nE', 'babel-l3'),
          link('l3y', 'nC', 'gw', 'babel-l3'),
          link('l3z', 'nE', 'gw', 'babel-l3'),
          link('up2', 'gw', 'internet', 'uplink'),
        ],
        clouds: [cloudA, cloudB],
        packets: [
          pkt('journey', ['phone', 'nA', 'nC', 'gw', 'internet'], 'data', {
            label: 'dados → internet',
            hopMs: 1000,
          }),
          pkt('alt-route', ['nC', 'nE', 'gw'], 'route', {
            label: 'rota alternativa',
            hopMs: 1300,
            offsetMs: 3200,
            color: 'var(--c-l3)',
          }),
        ],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'Wi-Fi até o ponto de acesso' },
        { swatch: 'var(--c-l2)', label: 'camada 2 dentro da nuvem' },
        { swatch: 'var(--c-l3)', label: 'camada 3 — Babel até o gateway' },
        { swatch: 'var(--c-up)', label: 'saída para a internet' },
      ],
    },

    // ------------------------------------------------------------ 6
    {
      id: 'quadro-completo',
      title: 'O quadro completo (e o que mais existe)',
      basic: [
        'Recapitulando a viagem: o celular se associa a um AP da nuvem (SSID/IP/MAC anycast), o batman-adv cola a nuvem numa única LAN (roaming sem queda), e o Babel roteia o pacote pela rede até o gateway de internet.',
        'O LibreMesh tem ainda mais peças que você verá em outras lições: o shared-state (sincroniza dados entre os nós), o Pirania (portal cativo com vouchers) e o lime-app (interface web que roda no celular).',
        'Tudo isso é automático: um nó novo, ao ligar, se auto-configura e passa a fazer parte da rede — sem configuração manual.',
      ],
      advanced: [
        {
          title: 'shared-state',
          paragraphs: [
            'É um banco de dados distribuído que replica informações (concessões de DHCP, lista de nós, métricas de enlace) por toda a mesh, de forma assíncrona. É a “memória compartilhada” da rede.',
          ],
        },
        {
          title: 'Pirania',
          paragraphs: [
            'Um portal cativo que usa o shared-state para controlar o acesso à rede por meio de vouchers — muito usado em redes comunitárias para distribuir acesso de forma justa.',
          ],
        },
        {
          title: 'lime-app e zero-config',
          paragraphs: [
            'O lime-app é a interface web (acessível pelo navegador do celular) para ver o status, alinhar antenas e configurar o nó. E o sistema se auto-configura no primeiro boot (first-boot-wizard), reduzindo ao mínimo o trabalho humano.',
          ],
        },
      ],
      diagram: {
        nodes: [phone(), nA, nB, nC, nD, nE, nF, gw, internet],
        links: [
          link('w4', 'phone', 'nA', 'wifi'),
          ...meshA,
          link('bB3', 'nE', 'nF', 'mesh-l2'),
          link('l3p', 'nC', 'nE', 'babel-l3'),
          link('l3q', 'nC', 'gw', 'babel-l3'),
          link('l3r', 'nE', 'gw', 'babel-l3'),
          link('up3', 'gw', 'internet', 'uplink'),
        ],
        clouds: [cloudA, cloudB],
        packets: [
          pkt('j2', ['phone', 'nA', 'nC', 'gw', 'internet'], 'data', {
            label: 'dados → internet',
            hopMs: 1000,
          }),
          pkt('sync', ['nC', 'nD', 'nA', 'nB'], 'sync', {
            label: 'shared-state',
            hopMs: 950,
            offsetMs: 1800,
          }),
        ],
      },
      legend: [
        { swatch: 'var(--c-wifi)', label: 'Wi-Fi' },
        { swatch: 'var(--c-l2)', label: 'camada 2 (batman-adv)' },
        { swatch: 'var(--c-l3)', label: 'camada 3 (Babel)' },
        { swatch: 'var(--c-up)', label: 'internet' },
        { swatch: 'var(--c-sync)', label: 'shared-state (sincronização)' },
      ],
    },
  ],
}
