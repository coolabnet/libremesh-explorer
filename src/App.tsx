import { useEffect, useState } from 'react'
import Home from './components/Home'
import LessonShell from './components/LessonShell'
import { getLesson, lessons } from './lessons/registry'

type View = { name: 'home' } | { name: 'lesson'; id: string }

function parseHash(): View {
  const m = window.location.hash.match(/^#\/licao\/([^/]+)$/)
  if (m) return { name: 'lesson', id: decodeURIComponent(m[1]) }
  return { name: 'home' }
}

export default function App() {
  const [view, setView] = useState<View>(parseHash)

  useEffect(() => {
    const onHash = () => setView(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openLesson = (id: string) => {
    window.location.hash = `#/licao/${id}`
  }
  const goHome = () => {
    window.location.hash = '#/'
  }

  if (view.name === 'lesson') {
    const lesson = getLesson(view.id)
    if (!lesson) return <Home lessons={lessons} onOpen={openLesson} />
    return <LessonShell lesson={lesson} onExit={goHome} />
  }

  return <Home lessons={lessons} onOpen={openLesson} />
}
