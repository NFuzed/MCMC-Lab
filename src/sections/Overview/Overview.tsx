import { useOverview } from './useOverview'

export function Overview() {
  const { heads, tails, coinMean, setCanvasRef, flipHeads, flipTails, reset } = useOverview()

  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 90px' }}>
      <h1 style={{ fontSize: 44, margin: '0 0 18px' }}>What is Bayesian inference?</h1>
      <p style={{ fontSize: 18, lineHeight: 1.65, color: 'var(--color-neutral-800)', maxWidth: 680 }}>
        Bayesian inference is a way of reasoning about uncertain quantities. You start with a{' '}
        <strong>belief</strong> about a parameter, then <strong>update</strong> that belief as data arrives —
        arriving at a new belief that accounts for both what you assumed and what you observed.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, margin: '40px 0' }}>
        <div className="card elev-sm" style={{ padding: 24 }}>
          <span className="tag tag-accent-2">Prior</span>
          <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55 }}>
            What you believe about a parameter before seeing new data — e.g. "a coin is probably close to fair."
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 24 }}>
          <span className="tag tag-accent">Likelihood</span>
          <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55 }}>
            How probable the observed data is, for each possible value of the parameter.
          </p>
        </div>
        <div className="card elev-sm" style={{ padding: 24 }}>
          <span className="tag tag-neutral">Posterior</span>
          <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55 }}>
            Prior × likelihood, renormalized. Your updated belief — the thing we actually want.
          </p>
        </div>
      </div>

      <div className="card elev-md" style={{ padding: 32, marginTop: 8 }}>
        <h3 style={{ fontSize: 22, margin: '0 0 8px' }}>Try it: flipping a coin</h3>
        <p style={{ margin: '0 0 18px', fontSize: 15, color: 'var(--color-neutral-700)' }}>
          Starting from a flat prior (any bias equally likely), each flip narrows the posterior over the coin's
          true bias.
        </p>
        <canvas
          ref={setCanvasRef}
          width={700}
          height={220}
          style={{
            width: '100%',
            height: 220,
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-neutral-100)',
            display: 'block',
          }}
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={flipHeads}>
            Flip → Heads
          </button>
          <button className="btn btn-secondary" onClick={flipTails}>
            Flip → Tails
          </button>
          <button className="btn btn-ghost" onClick={reset}>
            Reset
          </button>
          <span style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>
            {heads} heads, {tails} tails — posterior mean {coinMean}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 28 }}>Why not just calculate the posterior directly?</h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--color-neutral-800)', maxWidth: 700 }}>
          For a coin, the posterior has a tidy closed form. Real models rarely do — the posterior lives in many
          dimensions and its normalizing constant is an intractable integral. <strong>Markov chain Monte Carlo
          (MCMC)</strong> sidesteps this: instead of computing the posterior, it builds a Markov chain whose
          samples converge to it, exploring high-density regions of parameter space by random walk or by
          following the gradient of the density. The next section shows four such samplers exploring the same
          distributions.
        </p>
      </div>
    </section>
  )
}
