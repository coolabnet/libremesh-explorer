import { useState } from 'react'
import Home from './components/Home'
import LessonShell from './components/LessonShell'
import { getLesson, lessons } from './lessons/registry'

type View = { name: 'home' } | { name: 'lesson'; id: string }

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' })

  if (view.name === 'lesson') {
    const lesson = getLesson(view.id)
    if (!lesson) return null
    return <LessonShell lesson={lesson} onExit={() => setView({ name: 'home' })} />
  }

  return <Home lessons={lessons} onOpen={(id) => setView({ name: 'lesson', id })} />
}
