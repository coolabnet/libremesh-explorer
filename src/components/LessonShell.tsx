import { useCallback, useEffect, useState } from 'react'
import type { Lesson } from '../lessons/types'
import NetworkDiagram from './NetworkDiagram'

type Depth = 'basico' | 'avancado'

export default function LessonShell({
  lesson,
  onExit,
}: {
  lesson: Lesson
  onExit: () => void
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [depth, setDepth] = useState<Depth>('basico')

  const step = lesson.steps[index]
  const total = lesson.steps.length

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(total - 1, i)))
      setPlaying(true)
    },
    [total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(index + 1)
      if (e.key === 'ArrowLeft') goTo(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo])

  if (!step) return null

  return (
    <div className="lesson">
      <header className="lesson-header">
        <button className="btn-ghost" onClick={onExit}>
          ← Início
        </button>
        <div className="lesson-header-titles">
          <h1>{lesson.title}</h1>
          <span className="lesson-subtitle">{lesson.subtitle}</span>
        </div>
        <div className="lesson-header-actions">
          <button
            className="btn-ghost"
            onClick={() => setPlaying((p) => !p)}
            title={playing ? 'Pausar animação' : 'Reproduzir animação'}
          >
            {playing ? '❚❚ Pausar' : '▶ Reproduzir'}
          </button>
        </div>
      </header>

      <main className="lesson-body">
        <section className="narrative">
          <div className="depth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={depth === 'basico'}
              className={depth === 'basico' ? 'tab active' : 'tab'}
              onClick={() => setDepth('basico')}
            >
              Básico
            </button>
            <button
              role="tab"
              aria-selected={depth === 'avancado'}
              className={depth === 'avancado' ? 'tab active' : 'tab'}
              onClick={() => setDepth('avancado')}
              disabled={!step.advanced?.length}
            >
              Aprofundar
            </button>
          </div>

          <h2 className="step-title">{step.title}</h2>

          <div className="prose">
            {step.basic.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {depth === 'avancado' &&
            step.advanced?.map((b) => (
              <div className="advanced" key={b.title}>
                <h3>{b.title}</h3>
                {b.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ))}

          {step.legend && (
            <ul className="legend">
              {step.legend.map((l) => (
                <li key={l.label}>
                  <span className="swatch" style={{ background: l.swatch }} />
                  {l.label}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="stage">
          <NetworkDiagram key={step.id} diagram={step.diagram} playing={playing} />
        </section>
      </main>

      <footer className="stepper">
        <button className="btn" onClick={() => goTo(index - 1)} disabled={index === 0}>
          ← Anterior
        </button>
        <div className="dots">
          {lesson.steps.map((s, i) => (
            <button
              key={s.id}
              className={i === index ? 'dot active' : 'dot'}
              onClick={() => goTo(i)}
              title={s.title}
              aria-label={`Passo ${i + 1}: ${s.title}`}
            />
          ))}
        </div>
        <span className="step-count">
          {index + 1} / {total}
        </span>
        <button
          className="btn"
          onClick={() => goTo(index + 1)}
          disabled={index === total - 1}
        >
          Próximo →
        </button>
      </footer>
    </div>
  )
}
