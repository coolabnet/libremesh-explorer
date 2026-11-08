import type { Lesson } from '../lessons/types'

export default function Home({
  lessons,
  onOpen,
}: {
  lessons: Lesson[]
  onOpen: (id: string) => void
}) {
  return (
    <div className="home">
      <header className="hero">
        <div className="hero-badge">Redes mesh comunitárias · explicadas de forma visual</div>
        <h1>
          LibreMesh <span className="hero-accent">Explorer</span>
        </h1>
        <p className="hero-lede">
          Entenda, passo a passo e com animações, como funciona o{' '}
          <strong>LibreMesh</strong> — o sistema que transforma roteadores comuns nos nós de uma
          rede livre, aberta e descentralizada.
        </p>
        <div className="hero-pills">
          <span>batman-adv</span>
          <span>Babel</span>
          <span>anycast</span>
          <span>shared-state</span>
          <span>Pirania</span>
        </div>
      </header>

      <section className="lessons">
        {lessons.map((lesson) => (
          <article
            key={lesson.id}
            className={lesson.available ? 'card' : 'card card-disabled'}
            onClick={() => lesson.available && onOpen(lesson.id)}
          >
            <div className="card-top">
              <span className="card-order">{String(lesson.order).padStart(2, '0')}</span>
              {lesson.badge && <span className="card-badge">{lesson.badge}</span>}
            </div>
            <h2>{lesson.title}</h2>
            <p className="card-subtitle">{lesson.subtitle}</p>
            <p className="card-blurb">{lesson.blurb}</p>
            {lesson.available ? (
              <span className="card-cta">Começar lição →</span>
            ) : (
              <span className="card-cta card-cta-muted">Em breve</span>
            )}
          </article>
        ))}
      </section>

      <footer className="home-footer">
        <p>
          Projeto educacional de código aberto. Conteúdo baseado na documentação oficial do{' '}
          <a href="https://libremesh.org" target="_blank" rel="noreferrer">
            LibreMesh
          </a>
          .
        </p>
      </footer>
    </div>
  )
}
