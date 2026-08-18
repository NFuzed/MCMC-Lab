import { useCallback, useEffect, useRef, useState } from 'react'
import { coinPosteriorMean, drawCoinPosterior } from '../../models/coin'

export function useOverview() {
  const [heads, setHeads] = useState(0)
  const [tails, setTails] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    drawCoinPosterior(canvasRef.current, heads, tails)
  }, [heads, tails])

  const setCanvasRef = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el
  }, [])

  return {
    heads,
    tails,
    coinMean: coinPosteriorMean(heads, tails),
    setCanvasRef,
    flipHeads: () => setHeads((h) => h + 1),
    flipTails: () => setTails((t) => t + 1),
    reset: () => {
      setHeads(0)
      setTails(0)
    },
  }
}
