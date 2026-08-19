export type Point = [x: number, y: number]

export type TargetKey = 'gaussian' | 'bimodal' | 'banana'
export type SamplerKey = 'mh' | 'gibbs' | 'hmc' | 'nuts'
export type TabKey = 'overview' | 'algorithms' | 'compare' | 'ensembles' | 'casestudy'

export interface Target {
  key: string
  logdensity: (x: number, y: number) => number
  /** [xmin, xmax, ymin, ymax] */
  range: [number, number, number, number]
}

export interface StepResult {
  next: Point
  accepted: boolean
  /** Gibbs takes two sub-steps per iteration; this is the point after the first. */
  intermediate?: Point
}

/** Result of advancing an entire ensemble (population of walkers) by one sweep. */
export interface EnsembleStepResult {
  next: Point[]
  acceptedCount: number
}
