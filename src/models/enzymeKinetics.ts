import { randn, mean, stddev } from './stats'
import type { Point, Target } from './types'

export interface EnzymeDataPoint {
  S: number
  v: number
}

const SUBSTRATE_LEVELS = [0.5, 1, 2, 4, 8, 16, 32]

/** Synthetic Michaelis-Menten data: v = Vmax*S/(Km+S) + noise, with Vmax=40, Km=5. */
export function generateEnzymeData(): EnzymeDataPoint[] {
  return SUBSTRATE_LEVELS.map((S) => ({ S, v: (40 * S) / (5 + S) + randn() * 2.5 }))
}

/** Log-density over (Vmax, Km) given observed data, with flat priors on plausible ranges. */
export function makeEnzymeTarget(data: EnzymeDataPoint[]): Target {
  return {
    key: 'enzyme',
    logdensity: (vmax, km) => {
      if (vmax <= 0 || vmax > 100 || km <= 0 || km > 50) return -Infinity
      let ll = 0
      data.forEach((d) => {
        const pred = (vmax * d.S) / (km + d.S)
        ll += -0.5 * ((d.v - pred) / 2.5) ** 2
      })
      return ll
    },
    range: [0, 100, 0, 50],
  }
}

export interface EnzymeStats {
  vmaxMean: string
  vmaxSd: string
  kmMean: string
  kmSd: string
}

/** Draws observed data points plus posterior-predictive curves sampled from the chain. */
export function drawEnzymeData(canvas: HTMLCanvasElement | null, data: EnzymeDataPoint[], chain: Point[]) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f5ead8'
  ctx.fillRect(0, 0, W, H)

  const xmax = 35
  const ymax = 45
  const toPx = (S: number, v: number): Point => [20 + (S / xmax) * (W - 40), H - 20 - (v / ymax) * (H - 40)]

  const n = chain.length
  const burn = Math.floor(n * 0.2)
  const count = Math.min(40, Math.max(0, n - burn))
  for (let i = 0; i < count; i++) {
    const idx = burn + Math.floor(Math.random() * (n - burn))
    const [vmax, km] = chain[idx]
    ctx.beginPath()
    for (let S = 0; S <= xmax; S += 1) {
      const v = (vmax * S) / (km + S)
      const [px, py] = toPx(S, v)
      if (S === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.strokeStyle = 'rgba(198,113,57,0.18)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  data.forEach((d) => {
    const [px, py] = toPx(d.S, d.v)
    ctx.beginPath()
    ctx.arc(px, py, 4.5, 0, Math.PI * 2)
    ctx.fillStyle = '#201e1d'
    ctx.fill()
  })
}

/** Draws the joint posterior scatter over (Vmax, Km) and returns summary stats, or undefined if the chain is empty. */
export function drawEnzymePosterior(canvas: HTMLCanvasElement | null, chain: Point[]): EnzymeStats | undefined {
  if (!canvas) return undefined
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#f5ead8'
  ctx.fillRect(0, 0, W, H)

  const n = chain.length
  const burn = Math.floor(n * 0.2)
  const vmaxs: number[] = []
  const kms: number[] = []
  for (let i = burn; i < n; i++) {
    vmaxs.push(chain[i][0])
    kms.push(chain[i][1])
  }
  if (!vmaxs.length) return undefined

  const vmin = 20
  const vspan = 40
  const kmin = 0
  const kspan = 20
  const toPx = (vmax: number, km: number): Point => [((vmax - vmin) / vspan) * W, H - ((km - kmin) / kspan) * H]
  const start = Math.max(0, vmaxs.length - 1200)
  ctx.fillStyle = 'rgba(122,138,94,0.35)'
  for (let i = start; i < vmaxs.length; i++) {
    const [px, py] = toPx(vmaxs[i], kms[i])
    ctx.beginPath()
    ctx.arc(px, py, 2.2, 0, Math.PI * 2)
    ctx.fill()
  }

  return {
    vmaxMean: mean(vmaxs).toFixed(1),
    vmaxSd: stddev(vmaxs).toFixed(1),
    kmMean: mean(kms).toFixed(1),
    kmSd: stddev(kms).toFixed(1),
  }
}
