import { randn } from './stats'
import type { Point, SamplerKey, StepResult, Target } from './types'

export function gradient(target: Target, th: Point): Point {
  const eps = 1e-4
  const fx1 = target.logdensity(th[0] + eps, th[1])
  const fx0 = target.logdensity(th[0] - eps, th[1])
  const fy1 = target.logdensity(th[0], th[1] + eps)
  const fy0 = target.logdensity(th[0], th[1] - eps)
  return [(fx1 - fx0) / (2 * eps), (fy1 - fy0) / (2 * eps)]
}

export function mhStep(target: Target, current: Point, stepSize: number | Point): StepResult {
  const sx = Array.isArray(stepSize) ? stepSize[0] : stepSize
  const sy = Array.isArray(stepSize) ? stepSize[1] : stepSize
  const prop: Point = [current[0] + randn() * sx, current[1] + randn() * sy]
  const logAlpha = target.logdensity(prop[0], prop[1]) - target.logdensity(current[0], current[1])
  if (Math.log(Math.random()) < logAlpha) return { next: prop, accepted: true }
  return { next: current, accepted: false }
}

export function gibbsStep(target: Target, current: Point, stepSize: number): StepResult {
  let th: Point = [current[0], current[1]]
  let acc = false

  let prop: Point = [th[0] + randn() * stepSize, th[1]]
  if (Math.log(Math.random()) < target.logdensity(prop[0], prop[1]) - target.logdensity(th[0], th[1])) {
    th = prop
    acc = true
  }
  const afterX: Point = [th[0], th[1]]

  prop = [th[0], th[1] + randn() * stepSize]
  if (Math.log(Math.random()) < target.logdensity(prop[0], prop[1]) - target.logdensity(th[0], th[1])) {
    th = prop
    acc = true
  }

  return { next: th, accepted: acc, intermediate: afterX }
}

export function hmcStep(target: Target, current: Point, stepSize: number, leap: number): StepResult {
  let th: Point = [current[0], current[1]]
  let p: Point = [randn(), randn()]
  const p0: Point = [p[0], p[1]]
  let g = gradient(target, th)

  for (let i = 0; i < leap; i++) {
    p = [p[0] + 0.5 * stepSize * g[0], p[1] + 0.5 * stepSize * g[1]]
    th = [th[0] + stepSize * p[0], th[1] + stepSize * p[1]]
    g = gradient(target, th)
    p = [p[0] + 0.5 * stepSize * g[0], p[1] + 0.5 * stepSize * g[1]]
  }

  const H0 = -target.logdensity(current[0], current[1]) + 0.5 * (p0[0] ** 2 + p0[1] ** 2)
  const H1 = -target.logdensity(th[0], th[1]) + 0.5 * (p[0] ** 2 + p[1] ** 2)
  if (Math.log(Math.random()) < H0 - H1) return { next: th, accepted: true }
  return { next: current, accepted: false }
}

function buildTree(
  target: Target,
  theta: Point,
  p: Point,
  dir: 1 | -1,
  stepSize: number,
  nSteps: number
): { theta: Point; p: Point; states: Point[] } {
  const states: Point[] = []
  let th = theta
  let pp = p
  for (let i = 0; i < nSteps; i++) {
    let g = gradient(target, th)
    pp = [pp[0] + dir * stepSize * 0.5 * g[0], pp[1] + dir * stepSize * 0.5 * g[1]]
    th = [th[0] + dir * stepSize * pp[0], th[1] + dir * stepSize * pp[1]]
    g = gradient(target, th)
    pp = [pp[0] + dir * stepSize * 0.5 * g[0], pp[1] + dir * stepSize * 0.5 * g[1]]
    states.push(th)
  }
  return { theta: th, p: pp, states }
}

/**
 * Simplified trajectory-doubling NUTS: captures the U-turn stopping idea
 * (not every detail of the published algorithm) for visualization purposes.
 */
export function nutsStep(target: Target, current: Point, stepSize: number): StepResult {
  const p0: Point = [randn(), randn()]
  let thetaMinus = current
  let thetaPlus = current
  let pMinus = p0
  let pPlus = p0
  let samples: Point[] = [current]
  let j = 0
  let cont = true

  while (cont && j < 5) {
    const dir: 1 | -1 = Math.random() < 0.5 ? -1 : 1
    let newStates: Point[]
    if (dir === -1) {
      const r = buildTree(target, thetaMinus, pMinus, dir, stepSize, 2 ** j)
      thetaMinus = r.theta
      pMinus = r.p
      newStates = r.states
    } else {
      const r = buildTree(target, thetaPlus, pPlus, dir, stepSize, 2 ** j)
      thetaPlus = r.theta
      pPlus = r.p
      newStates = r.states
    }
    samples = samples.concat(newStates)
    const dx: Point = [thetaPlus[0] - thetaMinus[0], thetaPlus[1] - thetaMinus[1]]
    if (dx[0] * pMinus[0] + dx[1] * pMinus[1] < 0 || dx[0] * pPlus[0] + dx[1] * pPlus[1] < 0) cont = false
    j++
  }

  const weights = samples.map((s) => Math.exp(target.logdensity(s[0], s[1])))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  let acc = 0
  let chosen = samples[samples.length - 1]
  for (let i = 0; i < samples.length; i++) {
    acc += weights[i]
    if (r <= acc) {
      chosen = samples[i]
      break
    }
  }
  return { next: chosen, accepted: true }
}

export function runStep(
  algoKey: SamplerKey,
  target: Target,
  current: Point,
  stepSize: number,
  leap?: number
): StepResult {
  if (algoKey === 'mh') return mhStep(target, current, stepSize)
  if (algoKey === 'gibbs') return gibbsStep(target, current, stepSize)
  if (algoKey === 'hmc') return hmcStep(target, current, stepSize * 0.3, leap || 12)
  return nutsStep(target, current, stepSize * 0.3)
}
