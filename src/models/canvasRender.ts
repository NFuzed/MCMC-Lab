import type { Point, Target } from './types'

const heatmapCache = new Map<string, HTMLCanvasElement>()

function getHeatmap(target: Target): HTMLCanvasElement {
  const cached = heatmapCache.get(target.key)
  if (cached) return cached

  const res = 100
  const canvas = document.createElement('canvas')
  canvas.width = res
  canvas.height = res
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(res, res)
  const [xmin, xmax, ymin, ymax] = target.range
  let maxLd = -Infinity
  const grid = new Float64Array(res * res)

  for (let j = 0; j < res; j++) {
    const y = ymax - (j / (res - 1)) * (ymax - ymin)
    for (let i = 0; i < res; i++) {
      const x = xmin + (i / (res - 1)) * (xmax - xmin)
      const ld = target.logdensity(x, y)
      grid[j * res + i] = ld
      if (ld > maxLd) maxLd = ld
    }
  }
  for (let k = 0; k < res * res; k++) {
    const v = Math.exp(grid[k] - maxLd)
    const idx = k * 4
    img.data[idx] = 245 - 47 * v
    img.data[idx + 1] = 234 - 121 * v
    img.data[idx + 2] = 216 - 159 * v
    img.data[idx + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  heatmapCache.set(target.key, canvas)
  return canvas
}

/** Clears the cached heatmap for a target (e.g. after changing its parameters). */
export function invalidateHeatmap(key?: string) {
  if (key) heatmapCache.delete(key)
  else heatmapCache.clear()
}

/** Draws the target density as a heatmap plus the tail of a chain's path and its current point. */
export function drawDensityPanel(canvas: HTMLCanvasElement | null, target: Target, chain: Point[]) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.drawImage(getHeatmap(target), 0, 0, W, H)

  const [xmin, xmax, ymin, ymax] = target.range
  const toPx = (x: number, y: number): Point => [
    ((x - xmin) / (xmax - xmin)) * W,
    H - ((y - ymin) / (ymax - ymin)) * H,
  ]
  const n = chain.length
  const start = Math.max(0, n - 800)

  ctx.lineWidth = 1.4
  ctx.strokeStyle = 'rgba(122,138,94,0.55)'
  ctx.beginPath()
  for (let i = start; i < n; i++) {
    const [px, py] = toPx(chain[i][0], chain[i][1])
    if (i === start) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()

  if (n > 0) {
    const [cx, cy] = toPx(chain[n - 1][0], chain[n - 1][1])
    ctx.beginPath()
    ctx.arc(cx, cy, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#c67139'
    ctx.fill()
  }
}

/** Draws the target density as a heatmap plus every walker's current position as a dot. */
export function drawEnsemblePanel(canvas: HTMLCanvasElement | null, target: Target, walkers: Point[]) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.drawImage(getHeatmap(target), 0, 0, W, H)

  const [xmin, xmax, ymin, ymax] = target.range
  const toPx = (x: number, y: number): Point => [
    ((x - xmin) / (xmax - xmin)) * W,
    H - ((y - ymin) / (ymax - ymin)) * H,
  ]

  ctx.fillStyle = 'rgba(198,113,57,0.85)'
  walkers.forEach(([x, y]) => {
    const [px, py] = toPx(x, y)
    ctx.beginPath()
    ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fill()
  })
}

/** Draws x (terracotta) and y (sage) trace lines over the tail of a chain. */
export function drawTracePanel(canvas: HTMLCanvasElement | null, chain: Point[]) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)

  const n = chain.length
  const start = Math.max(0, n - 300)
  const xs = chain.slice(start).map((p) => p[0])
  const ys = chain.slice(start).map((p) => p[1])
  const all = xs.concat(ys)
  const mn = Math.min(...all)
  const mx = Math.max(...all) || 1
  const scaleY = (v: number) => H - ((v - mn) / (mx - mn + 1e-6)) * H

  const drawLine = (arr: number[], color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 1.4
    ctx.beginPath()
    arr.forEach((v, i) => {
      const px = (i / Math.max(arr.length - 1, 1)) * W
      const py = scaleY(v)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    })
    ctx.stroke()
  }
  drawLine(xs, '#c67139')
  drawLine(ys, '#7a8a5e')
}
