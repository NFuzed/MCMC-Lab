import { ChipGroup } from '../../components/ChipGroup/ChipGroup'
import { useCompare } from './useCompare'

export function Compare() {
  const {
    pgTarget,
    running,
    targetOptions,
    setPgTarget,
    toggleRunning,
    reset,
    setCanvasRefMh,
    setCanvasRefGibbs,
    setCanvasRefHmc,
    setCanvasRefNuts,
    samplesMh,
    acceptMh,
    samplesGibbs,
    acceptGibbs,
    samplesHmc,
    acceptHmc,
    samplesNuts,
    acceptNuts,
  } = useCompare()

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 90px' }}>
      <h1 style={{ fontSize: 36, margin: '0 0 8px' }}>Compare all four, side by side</h1>
      <p style={{ fontSize: 16, color: 'var(--color-neutral-700)', maxWidth: 700, margin: '0 0 28px' }}>
        Same target, same clock — watch how a random-walk sampler (Metropolis-Hastings, Gibbs) covers space
        differently from a gradient-guided one (HMC, NUTS).
      </p>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <ChipGroup options={targetOptions} active={pgTarget} onChange={setPgTarget} />
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
            <strong>Metropolis-Hastings</strong>
            <span className="tag tag-accent-2">Random walk</span>
          </div>
          <canvas
            ref={setCanvasRefMh}
            width={260}
            height={260}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block' }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            {samplesMh} draws · {acceptMh}% accepted
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <strong>Gibbs</strong>
            <span className="tag tag-accent-2">Random walk</span>
          </div>
          <canvas
            ref={setCanvasRefGibbs}
            width={260}
            height={260}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block' }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            {samplesGibbs} draws · {acceptGibbs}% accepted
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <strong>Hamiltonian Monte Carlo</strong>
            <span className="tag tag-accent">Gradient-based</span>
          </div>
          <canvas
            ref={setCanvasRefHmc}
            width={260}
            height={260}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block' }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            {samplesHmc} draws · {acceptHmc}% accepted
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <strong>NUTS (simplified)</strong>
            <span className="tag tag-accent">Gradient-based</span>
          </div>
          <canvas
            ref={setCanvasRefNuts}
            width={260}
            height={260}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block' }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            {samplesNuts} draws · {acceptNuts}% accepted
          </p>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 14 }}>
        NUTS here is a simplified trajectory-doubling implementation for visualization — it captures the U-turn
        stopping idea, not every detail of the published algorithm.
      </p>
    </section>
  )
}
