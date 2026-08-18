import { useCallback, useEffect, useRef, useState } from 'react'
import { mhStep } from '../../models/samplers'
import {
  drawEnzymeData,
  drawEnzymePosterior,
  generateEnzymeData,
  makeEnzymeTarget,
  type EnzymeDataPoint,
  type EnzymeStats,
} from '../../models/enzymeKinetics'
import type { Point, Target } from '../../models/types'

const STEPS_PER_FRAME = 40
const MAX_CHAIN_LENGTH = 4000
const DISPLAY_THROTTLE_FRAMES = 4
const PROPOSAL_STEP: Point = [3, 1.2]
const INITIAL_POINT: Point = [30, 8]

export function useCaseStudy() {
  const [running, setRunning] = useState(false)
  const [samples, setSamples] = useState(0)
  const [accepts, setAccepts] = useState(0)
  const [stats, setStats] = useState<EnzymeStats>({ vmaxMean: '—', vmaxSd: '—', kmMean: '—', kmSd: '—' })

  const dataRef = useRef<EnzymeDataPoint[]>(generateEnzymeData())
  const targetRef = useRef<Target>(makeEnzymeTarget(dataRef.current))
  const chainRef = useRef<Point[]>([INITIAL_POINT])
  const dataCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const postCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const countsRef = useRef({ samples: 0, accepts: 0 })
  const latestStatsRef = useRef<EnzymeStats | undefined>(undefined)
  const frameRef = useRef(0)
  const rafRef = useRef<number>()
  const runningRef = useRef(running)
  runningRef.current = running

  const redraw = useCallback(() => {
    drawEnzymeData(dataCanvasRef.current, dataRef.current, chainRef.current)
    const computed = drawEnzymePosterior(postCanvasRef.current, chainRef.current)
    if (computed) latestStatsRef.current = computed
  }, [])

  const setDataCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      dataCanvasRef.current = el
      redraw()
    },
    [redraw]
  )
  const setPostCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      postCanvasRef.current = el
      redraw()
    },
    [redraw]
  )

  useEffect(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      frameRef.current++
      if (!runningRef.current) return

      for (let i = 0; i < STEPS_PER_FRAME; i++) {
        const cur = chainRef.current[chainRef.current.length - 1]
        const res = mhStep(targetRef.current, cur, PROPOSAL_STEP)
        chainRef.current.push(res.next)
        if (chainRef.current.length > MAX_CHAIN_LENGTH) chainRef.current.shift()
        countsRef.current.samples++
        if (res.accepted) countsRef.current.accepts++
      }
      redraw()

      if (frameRef.current % DISPLAY_THROTTLE_FRAMES === 0 && latestStatsRef.current) {
        setSamples(countsRef.current.samples)
        setAccepts(countsRef.current.accepts)
        setStats(latestStatsRef.current)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [redraw])

  const reset = useCallback(() => {
    dataRef.current = generateEnzymeData()
    targetRef.current = makeEnzymeTarget(dataRef.current)
    chainRef.current = [INITIAL_POINT]
    countsRef.current = { samples: 0, accepts: 0 }
    latestStatsRef.current = undefined
    setRunning(false)
    setSamples(0)
    setAccepts(0)
    setStats({ vmaxMean: '—', vmaxSd: '—', kmMean: '—', kmSd: '—' })
    redraw()
  }, [redraw])

  return {
    running,
    runLabel: running ? 'Pause' : 'Run MCMC',
    samples,
    accepts,
    ...stats,
    setDataCanvasRef,
    setPostCanvasRef,
    toggleRunning: () => setRunning((r) => !r),
    reset,
  }
}
