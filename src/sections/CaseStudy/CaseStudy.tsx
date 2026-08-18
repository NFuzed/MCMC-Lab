import { useCaseStudy } from './useCaseStudy'

export function CaseStudy() {
  const {
    runLabel,
    setDataCanvasRef,
    setPostCanvasRef,
    toggleRunning,
    reset,
    vmaxMean,
    vmaxSd,
    kmMean,
    kmSd,
  } = useCaseStudy()

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 90px' }}>
      <h1 style={{ fontSize: 36, margin: '0 0 8px' }}>Where this matters: enzyme kinetics</h1>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--color-neutral-800)', maxWidth: 720, margin: '0 0 28px' }}>
        Fitting the Michaelis-Menten model v = V<sub>max</sub>·S / (K<sub>m</sub> + S) to noisy reaction-rate
        measurements is a routine computational biology task. A single best-fit curve hides how uncertain
        V<sub>max</sub> and K<sub>m</sub> really are. Running MCMC over the two parameters instead gives a full
        posterior — every plausible curve, and how confident we should be in each.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={toggleRunning}>
          {runLabel}
        </button>
        <button className="btn btn-ghost" onClick={reset}>
          New synthetic data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontSize: 14 }}>Data and posterior predictive curves</strong>
          <canvas
            ref={setDataCanvasRef}
            width={600}
            height={320}
            style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-md)', display: 'block', marginTop: 10 }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '8px 0 0' }}>
            Dots: measured reaction rate at each substrate concentration. Lines: curves implied by posterior
            samples of (V<sub>max</sub>, K<sub>m</sub>).
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontSize: 14 }}>Joint posterior over the parameters</strong>
          <canvas
            ref={setPostCanvasRef}
            width={300}
            height={300}
            style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', display: 'block', marginTop: 10 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontSize: 13 }}>
            <div>
              <div style={{ color: 'var(--color-neutral-600)' }}>
                V<sub>max</sub>
              </div>
              <strong>
                {vmaxMean} ± {vmaxSd}
              </strong>
            </div>
            <div>
              <div style={{ color: 'var(--color-neutral-600)' }}>
                K<sub>m</sub>
              </div>
              <strong>
                {kmMean} ± {kmSd}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
