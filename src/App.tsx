import { useState } from 'react'
import { Nav } from './components/Nav/Nav'
import { Overview } from './sections/Overview/Overview'
import { Algorithms } from './sections/Algorithms/Algorithms'
import { Compare } from './sections/Compare/Compare'
import { CaseStudy } from './sections/CaseStudy/CaseStudy'
import type { TabKey } from './models/types'

export function App() {
  const [tab, setTab] = useState<TabKey>('overview')

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
      <Nav active={tab} onChange={setTab} />
      {tab === 'overview' && <Overview />}
      {tab === 'algorithms' && <Algorithms />}
      {tab === 'compare' && <Compare />}
      {tab === 'casestudy' && <CaseStudy />}
    </div>
  )
}
