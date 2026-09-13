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

const GITHUB_URL = 'https://github.com/OxfordRSE/bayesrs'

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
        -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07
        -1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
        a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15
        0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38
        A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

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
        <a
          className="nav-github"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          title="GitHub repository"
        >
          <GithubIcon />
        </a>
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
          <a
            className="nav-tab"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            GitHub repository
          </a>
        </div>
      )}
    </div>
  )
}
