import type { TabKey } from '../../models/types'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'algorithms', label: 'Algorithms' },
  { key: 'compare', label: 'Compare' },
  { key: 'casestudy', label: 'Case study' },
]

interface NavProps {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function Nav({ active, onChange }: NavProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-neutral-300)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>MCMC Lab</div>
      <div style={{ display: 'flex', gap: 8 }}>
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
    </div>
  )
}
