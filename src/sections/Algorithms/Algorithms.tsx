import { ChipGroup } from '../../components/ChipGroup/ChipGroup'
import { useAlgorithms } from './useAlgorithms'

export function Algorithms() {
  const {
    target,
    algo,
    rho,
    step,
    leap,
    running,
    samples,
    acceptRate,
    setCanvasRef,
    setTraceRef,
    targetOptions,
    algoOptions,
    showRhoSlider,
    showLeapSlider,
    algoLabel,
    algoTag,
    algoDescription,
    setTarget,
    setAlgo,
    setRho,
    setStep,
    setLeap,
    toggleRunning,
    reset,
  } = useAlgorithms()

  return (
    <section style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 90px' }}>
      <h1 style={{ fontSize: 36, margin: '0 0 8px' }}>Sampling algorithms, one at a time</h1>
      <p style={{ fontSize: 16, color: 'var(--color-neutral-700)', maxWidth: 680, margin: '0 0 32px' }}>
        Pick a target distribution and a sampler, then watch it explore. The shaded surface is the true density;
        the line is the sampler's path.
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ flex: 'none' }}>
          <canvas
            ref={setCanvasRef}
            width={480}
            height={480}
            style={{ width: 480, height: 480, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'block' }}
          />
          <canvas
            ref={setTraceRef}
            width={480}
            height={90}
            style={{
              width: 480,
              height: 90,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-neutral-100)',
              display: 'block',
              marginTop: 10,
            }}
          />
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: '6px 0 0' }}>
            Trace of x (terracotta) and y (sage) over the last 300 draws — a mixing chain looks noisy, a stuck one
            looks flat.
          </p>
        </div>

        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-neutral-700)' }}>
              Target distribution
            </div>
            <ChipGroup options={targetOptions} active={target} onChange={setTarget} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-neutral-700)' }}>
              Sampler
            </div>
            <ChipGroup options={algoOptions} active={algo} onChange={setAlgo} />
          </div>

          {showRhoSlider && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
                Correlation ρ = {rho.toFixed(2)}
              </div>
              <input
                type="range"
                min={-0.95}
                max={0.95}
                step={0.05}
                value={rho}
                onChange={(e) => setRho(parseFloat(e.target.value))}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
              Step size = {step.toFixed(2)}
            </div>
            <input
              type="range"
              min={0.05}
              max={1.2}
              step={0.05}
              value={step}
              onChange={(e) => setStep(parseFloat(e.target.value))}
            />
          </div>

          {showLeapSlider && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-neutral-700)', marginBottom: 6 }}>
                Leapfrog steps = {leap}
              </div>
              <input
                type="range"
                min={2}
                max={30}
                step={1}
                value={leap}
                onChange={(e) => setLeap(parseInt(e.target.value, 10))}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={toggleRunning}>
              {running ? 'Pause' : 'Run'}
            </button>
            <button className="btn btn-ghost" onClick={reset}>
              Reset
            </button>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 6 }}>
              <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{algoLabel}</strong>
              <span className={`tag ${algoTag.className}`}>{algoTag.text}</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, color: 'var(--color-neutral-800)' }}>
              {algoDescription}
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: '10px 0 0' }}>
              {samples} samples drawn · {acceptRate}% accepted
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
