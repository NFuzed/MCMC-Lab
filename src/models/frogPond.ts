import type { Point } from './types'

export interface LilyPad {
  id: number
  x: number
  y: number
}

/** Lily pad pixel coordinates, adapted from the UNIQ+ deck's `lilypad_locations`. */
const RAW_LOCATIONS: Point[] = [
  [510, 165],
  [917, 358],
  [94, 81],
  [383, 71],
  [630, 72],
  [917, 120],
  [228, 181],
  [385, 251],
  [605, 252],
  [782, 208],
  [94, 366],
  [252, 320],
  [470, 350],
  [708, 352],
]

/** Normalizes the raw coordinates into a [0,1]x[0,1] box with a single isotropic
 * scale factor, so relative distances between pads (and therefore jump weights)
 * match the original layout instead of being stretched per axis. */
function normalize(points: Point[]): LilyPad[] {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const xmin = Math.min(...xs)
  const xmax = Math.max(...xs)
  const ymin = Math.min(...ys)
  const ymax = Math.max(...ys)
  const xrange = xmax - xmin
  const yrange = ymax - ymin
  const scale = Math.max(xrange, yrange) || 1
  const xoff = (scale - xrange) / 2
  const yoff = (scale - yrange) / 2
  return points.map(([x, y], id) => ({
    id,
    x: (x - xmin + xoff) / scale,
    y: (y - ymin + yoff) / scale,
  }))
}

export const LILY_PADS: LilyPad[] = normalize(RAW_LOCATIONS)
export const STARTING_PAD = 0
export const PROB_STAY = 0.2

export type TransitionMatrix = number[][]

/** Weight to every other pad ∝ 1/distance², normalized to (1 - probStay), plus
 * probStay chance of staying — ported from the deck's `transition_row()`. */
function transitionRow(from: LilyPad, pads: LilyPad[], probStay: number): number[] {
  const weights = pads.map((p) => {
    if (p.id === from.id) return 0
    const dx = from.x - p.x
    const dy = from.y - p.y
    return 1 / (dx * dx + dy * dy)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  const row = weights.map((w) => (w / total) * (1 - probStay))
  row[from.id] = probStay
  return row
}

export function buildTransitionMatrix(pads: LilyPad[] = LILY_PADS, probStay: number = PROB_STAY): TransitionMatrix {
  return pads.map((pad) => transitionRow(pad, pads, probStay))
}

/** Samples the next pad from the current pad's transition row via inverse-CDF,
 * matching the deck's `simulate()` inner loop. */
export function sampleNext(matrix: TransitionMatrix, current: number): number {
  let r = Math.random()
  const row = matrix[current]
  for (let k = 0; k < row.length; k++) {
    r -= row[k]
    if (r < 0) return k
  }
  return row.length - 1
}
