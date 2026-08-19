import { randn } from './stats'
import type { EnsembleStepResult, Point, Target } from './types'

/** Target dimensionality assumed by the stretch-move acceptance ratio. */
const DIMENSION = 2

/** Default stretch scale `a`, matching emcee's package default. */
export const DEFAULT_A = 2

/** Scatters n walkers as small Gaussian perturbations around a starting point. */
export function initEnsemble(start: Point, n: number, spread = 0.5): Point[] {
  const walkers: Point[] = []
  for (let i = 0; i < n; i++) {
    walkers.push([start[0] + randn() * spread, start[1] + randn() * spread])
  }
  return walkers
}

/** Draws a stretch factor z from g(z) ∝ 1/sqrt(z) on [1/a, a] via inverse-CDF sampling. */
function sampleStretch(a: number): number {
  const u = Math.random()
  return ((a - 1) * u + 1) ** 2 / a
}

function stretchMoveHalf(
  target: Target,
  moving: Point[],
  complementary: Point[],
  a: number
): { updated: Point[]; accepted: number } {
  const updated = moving.slice()
  let accepted = 0

  for (let k = 0; k < moving.length; k++) {
    const xk = moving[k]
    const xj = complementary[Math.floor(Math.random() * complementary.length)]
    const z = sampleStretch(a)
    const prop: Point = [xj[0] + z * (xk[0] - xj[0]), xj[1] + z * (xk[1] - xj[1])]

    const logRatio = (DIMENSION - 1) * Math.log(z) + target.logdensity(prop[0], prop[1]) - target.logdensity(xk[0], xk[1])
    if (Math.log(Math.random()) < logRatio) {
      updated[k] = prop
      accepted++
    }
  }

  return { updated, accepted }
}

/**
 * One full sweep of the affine-invariant ensemble ("stretch move") sampler
 * used by the emcee package (Goodman & Weare, 2010): the ensemble is split
 * into two complementary halves, each updated in turn against the other so
 * every proposal is invariant to affine reparameterizations of the target
 * (it handles correlated/skewed densities without hand-tuned step sizes).
 * Requires at least 4 walkers.
 */
export function emceeStep(target: Target, walkers: Point[], a: number = DEFAULT_A): EnsembleStepResult {
  const mid = Math.floor(walkers.length / 2)
  const s0 = walkers.slice(0, mid)
  const s1 = walkers.slice(mid)

  const r1 = stretchMoveHalf(target, s1, s0, a)
  const r2 = stretchMoveHalf(target, s0, r1.updated, a)

  return { next: r2.updated.concat(r1.updated), acceptedCount: r1.accepted + r2.accepted }
}
