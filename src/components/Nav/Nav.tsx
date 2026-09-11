import { useState } from 'react'
import type { TabKey } from '../../models/types'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'markov', label: 'Markov Chains' },
  { key: 'algorithms', label: 'Algorithms' },
  { key: 'compare', label: 'Compare' },
  { key: 'ensembles', label: 'Ensembles' },
  { key: 'casestudy', label: 'Case study' },
]

interface NavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function Nav({ active, onChange }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSelect = (key: TabKey) => {
    onChange(key)
    setMenuOpen(false)
  }

  return (
    <div className="nav-bar">
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>MCMC Lab</div>

      <div className="nav-tabs-desktop">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`nav-tab${active === t.key ? ' active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <button
        className="nav-hamburger"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <div className="nav-menu-mobile">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`nav-tab${active === t.key ? ' active' : ''}`}
              onClick={() => handleSelect(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
