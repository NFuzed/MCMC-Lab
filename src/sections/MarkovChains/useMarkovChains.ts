import { useMemo, useState } from 'react'
import { LILY_PADS, STARTING_PAD, buildTransitionMatrix, sampleNext } from '../../models/frogPond'

const RUN_JUMPS = 10000

export function useMarkovChains() {
  const matrix = useMemo(() => buildTransitionMatrix(), [])
  const [current, setCurrent] = useState(STARTING_PAD)
  const [counts, setCounts] = useState<number[]>(() => new Array(LILY_PADS.length).fill(0))
  const [totalSteps, setTotalSteps] = useState(0)

  const jumpOnce = () => {
    setCounts((prev) => {
      const next = prev.slice()
      next[current]++
      return next
    })
    setCurrent((c) => sampleNext(matrix, c))
    setTotalSteps((s) => s + 1)
  }

  const runMany = () => {
    const localCounts = counts.slice()
    let c = current
    for (let i = 0; i < RUN_JUMPS; i++) {
      localCounts[c]++
      c = sampleNext(matrix, c)
    }
    setCounts(localCounts)
    setCurrent(c)
    setTotalSteps((s) => s + RUN_JUMPS)
  }

  const reset = () => {
    setCurrent(STARTING_PAD)
    setCounts(new Array(LILY_PADS.length).fill(0))
    setTotalSteps(0)
  }

  const shares = totalSteps > 0 ? counts.map((c) => (100 * c) / totalSteps) : null

  return {
    pads: LILY_PADS,
    current,
    totalSteps,
    shares,
    jumpOnce,
    runMany,
    reset,
  }
}
