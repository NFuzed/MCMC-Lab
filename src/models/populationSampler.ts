import { randn } from './stats'
import type { EnsembleStepResult, Point, Target } from './types'

/** Optimal DE-MC scale for a 2-D target (ter Braak, 2006): 2.38/sqrt(2d). */
export const DEFAULT_GAMMA = 2.38 / Math.sqrt(2 * 2)

const JITTER = 1e-4

/** Scatters n walkers as small Gaussian perturbations around a starting point. */
export function initPopulation(start: Point, n: number, spread = 0.5): Point[] {
  const walkers: Point[] = []
  for (let i = 0; i < n; i++) {
    walkers.push([start[0] + randn() * spread, start[1] + randn() * spread])
  }
  return walkers
}

/**
 * One sweep of Differential Evolution MCMC (ter Braak, 2006): each walker
 * proposes a move along the difference vector between two other, randomly
 * chosen walkers scaled by gamma, plus a small jitter term for ergodicity.
 * Proposals are drawn against the pre-sweep ensemble so every walker's
 * update is independent of update order.
 */
export function populationStep(target: Target, walkers: Point[], gamma: number = DEFAULT_GAMMA): EnsembleStepResult {
  const n = walkers.length
  const next = walkers.slice()
  let acceptedCount = 0

  for (let i = 0; i < n; i++) {
    const current = walkers[i]
    let i1 = i
    let i2 = i
    while (i1 === i) i1 = Math.floor(Math.random() * n)
    while (i2 === i || i2 === i1) i2 = Math.floor(Math.random() * n)

    const prop: Point = [
      current[0] + gamma * (walkers[i1][0] - walkers[i2][0]) + randn() * JITTER,
      current[1] + gamma * (walkers[i1][1] - walkers[i2][1]) + randn() * JITTER,
    ]

    const logAlpha = target.logdensity(prop[0], prop[1]) - target.logdensity(current[0], current[1])
    if (Math.log(Math.random()) < logAlpha) {
      next[i] = prop
      acceptedCount++
    }
  }

  return { next, acceptedCount }
}
