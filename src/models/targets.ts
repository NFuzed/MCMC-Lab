import type { Target, TargetKey } from './types'

export const TARGET_LABELS: Record<TargetKey, string> = {
  gaussian: 'Correlated Gaussian',
  bimodal: 'Bimodal',
  banana: 'Banana',
}

export function getTarget(key: TargetKey, params: { rho?: number } = {}): Target {
  if (key === 'gaussian') {
    const rho = params.rho ?? 0.8
    return {
      key: `gaussian_${rho}`,
      logdensity: (x, y) => (-0.5 / (1 - rho * rho)) * (x * x - 2 * rho * x * y + y * y),
      range: [-3.5, 3.5, -3.5, 3.5],
    }
  }
  if (key === 'bimodal') {
    return {
      key: 'bimodal',
      logdensity: (x, y) => {
        const d1 = Math.exp(-0.5 * (((x + 2) ** 2 + y * y) / 0.5))
        const d2 = Math.exp(-0.5 * (((x - 2) ** 2 + y * y) / 0.5))
        return Math.log(0.5 * d1 + 0.5 * d2 + 1e-300)
      },
      range: [-4, 4, -3, 3],
    }
  }
  return {
    key: 'banana',
    logdensity: (x, y) => -0.5 * ((x * x) / 4 + (y - 0.15 * (x * x - 4)) ** 2),
    range: [-4.5, 4.5, -3, 6],
  }
}
