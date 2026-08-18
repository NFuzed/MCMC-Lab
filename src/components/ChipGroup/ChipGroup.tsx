interface ChipGroupProps<T extends string> {
  options: { key: T; label: string }[]
  active: T
  onChange: (key: T) => void
}

export function ChipGroup<T extends string>({ options, active, onChange }: ChipGroupProps<T>) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map((o) => (
        <button
          key={o.key}
          className={`chip${active === o.key ? ' active' : ''}`}
          onClick={() => onChange(o.key)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
