# LibreMesh Explorer

Explorador interativo e animado para explicar como funciona o **LibreMesh** — o sistema que
transforma roteadores comuns nos nós de uma rede livre, aberta e descentralizada.

Inspirado no [Protocol Explorer](https://protocol-explorer-alpha.vercel.app/), mas focado no
funcionamento de uma rede mesh comunitária: a camada 2 com **batman-adv**, o roteamento com
**Babel**, o conceito de **anycast** e a saída para a internet.

## Stack

- Vite + React + TypeScript
- Diagramas em **SVG animado** (sem dependências de animação — `requestAnimationFrame`)
- Conteúdo em **português (pt-BR)**, com dois níveis: **Básico** e **Aprofundar**

## Como rodar

```bash
pnpm install
pnpm dev      # servidor de desenvolvimento
pnpm build    # build de produção (dist/)
pnpm preview  # serve o build de produção
```

> Dica: se o `pnpm` tentar escrever em diretórios fora do projeto (ambientes com sandbox),
> redirecione o estado para dentro do repo:
>
> ```bash
> export XDG_DATA_HOME="$PWD/.xdg-data" XDG_CACHE_HOME="$PWD/.xdg-cache"
> ```

## Estrutura

```
src/
  lessons/
    types.ts                 # tipos de lições, passos e diagramas
    registry.ts              # lista de lições
    client-to-internet.ts    # lição 1: "Do cliente à internet"
  components/
    NetworkDiagram.tsx       # motor de diagrama SVG animado
    LessonShell.tsx          # página da lição (stepper + narrativa)
    Home.tsx                 # página inicial
  styles/global.css          # tema claro/escuro + layout responsivo
```

## Adicionar uma lição

1. Crie um arquivo em `src/lessons/` exportando um objeto `Lesson`.
2. Registre-o em `src/lessons/registry.ts`.

Cada passo (`LessonStep`) tem texto básico, texto de aprofundamento opcional e um `DiagramSpec`
(nós, enlaces, nuvens e pacotes animados) — veja os tipos em `src/lessons/types.ts`.

## Deploy no GitHub Pages

O deploy é feito via GitHub Actions (`.github/workflows/deploy.yml`): a cada `push` na branch
`main`, ele instala as dependências, roda `pnpm build` e publica a pasta `dist`.

No repositório, configure uma única vez em **Settings → Pages**:

- **Source**: *GitHub Actions*

Depois de dar push, o site fica disponível em
`https://<org>.github.io/libremesh-explorer/`. O `base` do Vite está como `./`, então os assets
são relativos e funcionam em qualquer subcaminho (ou domínio próprio).

## Fontes

Conteúdo baseado na documentação oficial do [LibreMesh](https://libremesh.org), em especial a
página ["What is LibreMesh?"](https://libremesh.org/what-is-libremesh.html).
