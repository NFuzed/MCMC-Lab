import { logBetaInt } from './stats'

/** Draws the Beta(heads+1, tails+1) posterior density for a coin's bias. */
export function drawCoinPosterior(canvas: HTMLCanvasElement | null, heads: number, tails: number) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')!
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)

  const logB = logBetaInt(heads + 1, tails + 1)
  const N = 200
  const pts: number[] = []
  let maxPdf = 0
  for (let i = 0; i <= N; i++) {
    const p = Math.max(1e-4, Math.min(1 - 1e-4, i / N))
    const logpdf = heads * Math.log(p) + tails * Math.log(1 - p) - logB
    const pdf = Math.exp(logpdf)
    pts.push(pdf)
    if (pdf > maxPdf) maxPdf = pdf
  }

  ctx.beginPath()
  ctx.moveTo(0, H)
  pts.forEach((pdf, i) => {
    const x = (i / N) * W
    const y = H - (pdf / maxPdf) * (H - 20) - 10
    ctx.lineTo(x, y)
  })
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fillStyle = 'rgba(122,138,94,0.25)'
  ctx.fill()

  ctx.beginPath()
  pts.forEach((pdf, i) => {
    const x = (i / N) * W
    const y = H - (pdf / maxPdf) * (H - 20) - 10
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.strokeStyle = '#7a8a5e'
  ctx.lineWidth = 2.5
  ctx.stroke()
}

export function coinPosteriorMean(heads: number, tails: number): string {
  return ((heads + 1) / (heads + tails + 2)).toFixed(2)
}
