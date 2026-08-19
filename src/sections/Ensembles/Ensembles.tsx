import { ChipGroup } from '../../components/ChipGroup/ChipGroup'
import { useEnsembles } from './useEnsembles'

export function Ensembles() {
  const {
    target,
    running,
    targetOptions,
    setTarget,
    toggleRunning,
    reset,
    setPopCanvasRef,
    setEmceeCanvasRef,
    walkerCount,
    popGenerations,
    popAcceptRate,
    emceeGenerations,
    emceeAcceptRate,
  } = useEnsembles()

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 90px' }}>
      <h1 style={{ fontSize: 36, margin: '0 0 8px' }}>Ensemble samplers: a population of walkers</h1>
      <p style={{ fontSize: 16, color: 'var(--color-neutral-700)', maxWidth: 700, margin: '0 0 28px' }}>
        Instead of one chain taking steps, {walkerCount} walkers explore the target together — each proposing
        its next move using the current positions of the others. Dots are every walker's current position.
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <ChipGroup options={targetOptions} active={target} onChange={setTarget} />
        <button className="btn btn-primary" onClick={toggleRunning}>
          {running ? 'Pause' : 'Run'}
        </button>
        <button className="btn btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card elev-sm" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <strong>Population (Differential Evolution)</strong>
            <span className="tag tag-accent-2">Ensemble</span>
          </div>
          <canvas
            ref={setPopCanvasRef}
            width={480}
            height={480}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block' }}
          />
          <p style={{ fontSize: 13, lineHeight: 1.55, margin: '10px 0 0', color: 'var(--color-neutral-800)' }}>
            Each walker jumps along the difference between two other random walkers, scaled by γ ≈ 2.38/√(2d) —
            the population's own spread sets the step size.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            {popGenerations} generations · {popAcceptRate}% accepted
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <strong>emcee (stretch move)</strong>
            <span className="tag tag-accent-2">Ensemble</span>
          </div>
          <canvas
            ref={setEmceeCanvasRef}
            width={480}
            height={480}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block' }}
          />
          <p style={{ fontSize: 13, lineHeight: 1.55, margin: '10px 0 0', color: 'var(--color-neutral-800)' }}>
            The affine-invariant "stretch move" (Goodman &amp; Weare, 2010) used by the Python emcee package:
            walkers split into two halves and stretch toward a random walker in the other half, invariant to
            how correlated or skewed the target is.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            {emceeGenerations} generations · {emceeAcceptRate}% accepted
          </p>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 14 }}>
        Both are population-based: no gradient, no hand-tuned step size — the ensemble's own spread does the
        work that a single chain would need a tuned proposal for.
      </p>
    </section>
  )
}
