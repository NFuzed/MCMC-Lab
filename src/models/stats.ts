/** Standard normal draw via Box-Muller. */
export function randn(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function logFactorial(n: number): number {
  let s = 0
  for (let i = 2; i <= n; i++) s += Math.log(i)
  return s
}

/** log of the integer Beta function B(a, b) = (a-1)!(b-1)! / (a+b-1)! */
export function logBetaInt(a: number, b: number): number {
  return logFactorial(a - 1) + logFactorial(b - 1) - logFactorial(a + b - 1)
}

export function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

export function stddev(arr: number[]): number {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length)
}
