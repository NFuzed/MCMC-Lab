import { FrogPond } from './FrogPond'
import { useMarkovChains } from './useMarkovChains'

export function MarkovChains() {
  const { pads, current, totalSteps, shares, jumpOnce, runMany, reset } = useMarkovChains()

  return (
    <section style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px 90px' }}>
      <h1 style={{ fontSize: 36, margin: '0 0 8px' }}>Markov chain Monte Carlo</h1>
      <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--color-neutral-800)', maxWidth: 720, margin: '0 0 32px' }}>
        MCMC is two ideas stacked together: a <strong>Markov chain</strong>, a memoryless sequence of steps, driven
        by <strong>Monte Carlo</strong>, estimating something hard by generating lots of random samples. Put them
        together and you get a way to explore a distribution you can't write down directly.
      </p>

      <h2 style={{ fontSize: 22, margin: '0 0 14px' }}>Markov chains</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 16 }}>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>What it is</strong>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
            A sequence of steps where each one depends only on where you are now.
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>No memory</strong>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
            The path that got you here doesn't matter, only your current position.
          </p>
        </div>
      </div>
      <div className="card elev-sm" style={{ padding: 20, marginBottom: 40, textAlign: 'center' }}>
        <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>Everyday example</strong>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--color-neutral-800)' }}>
          Bus times: bus times depend on the schedule today, not yesterday.
        </p>
      </div>

      <h2 style={{ fontSize: 22, margin: '0 0 14px' }}>Monte Carlo</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 48 }}>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>The idea</strong>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
            Estimate something hard by generating lots of random samples.
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>The name</strong>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
            Borrowed from the casino: randomness used deliberately.
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>The classic example</strong>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
            Throw darts at a square with a circle in it; the fraction landing inside gives you π.
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 20 }}>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>Why it works</strong>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>
            More samples, better estimate. No clever maths required, just volume.
          </p>
        </div>
      </div>

      <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>The frog pond</h2>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-700)', maxWidth: 720, margin: '0 0 20px' }}>
        A frog sits on one of 14 lily pads. Every pad has a true probability of being the "best" pad — unknown to
        the frog. Each jump, it weighs a nearby pad against its current one purely by proximity and hops there most
        of the time, staying put 1 in 5 jumps. It never learns the pond's layout — yet given enough jumps, the
        fraction of time it spends on each pad converges to that pad's true probability. That's the Markov chain
        doing Monte Carlo: sampling a distribution by wandering, not by computing it.
      </p>

      <div className="card elev-md" style={{ padding: 24 }}>
        <FrogPond pads={pads} current={current} shares={shares} />
        <div style={{ display: 'flex', gap: 12, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={jumpOnce}>
            Jump
          </button>
          <button className="btn btn-secondary" onClick={runMany}>
            Run 10,000 jumps
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            Reset
          </button>
          <span style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>{totalSteps.toLocaleString()} jumps so far</span>
        </div>
      </div>
    </section>
  )
}
