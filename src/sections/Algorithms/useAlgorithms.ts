import { useCallback, useEffect, useRef, useState } from 'react'
import { getTarget, TARGET_LABELS } from '../../models/targets'
import { runStep } from '../../models/samplers'
import { drawDensityPanel, drawTracePanel } from '../../models/canvasRender'
import type { Point, SamplerKey, TargetKey } from '../../models/types'

const ALGO_LABELS: Record<SamplerKey, string> = {
  mh: 'Metropolis-Hastings',
  gibbs: 'Gibbs',
  hmc: 'HMC',
  nuts: 'NUTS',
}

const ALGO_DESCRIPTIONS: Record<SamplerKey, string> = {
  mh: 'Proposes a random jump from the current point and accepts it with probability proportional to how much more likely the new point is. Simple, general, but can wander slowly in correlated or high-dimensional spaces.',
  gibbs: 'Updates one coordinate at a time, holding the others fixed. Efficient when conditional distributions are simple, but moves along the axes, which struggles on strongly correlated targets.',
  hmc: 'Uses the gradient of the log-density to simulate physical dynamics (a particle rolling on the density surface), taking longer, more informed steps than a random walk.',
  nuts: 'Extends HMC by automatically choosing how far to simulate, stopping when the trajectory starts turning back on itself — no hand-tuned step count.',
}

const ALGO_TAGS: Record<SamplerKey, { className: string; text: string }> = {
  mh: { className: 'tag-accent-2', text: 'Random walk' },
  gibbs: { className: 'tag-accent-2', text: 'Random walk' },
  hmc: { className: 'tag-accent', text: 'Gradient-based' },
  nuts: { className: 'tag-accent', text: 'Gradient-based' },
}

const TARGET_OPTIONS: TargetKey[] = ['gaussian', 'bimodal', 'banana']
const ALGO_OPTIONS: SamplerKey[] = ['mh', 'gibbs', 'hmc', 'nuts']
const STEPS_PER_FRAME = 3
const MAX_CHAIN_LENGTH = 3000
const DISPLAY_THROTTLE_FRAMES = 4

export function useAlgorithms() {
  const [target, setTargetState] = useState<TargetKey>('gaussian')
  const [algo, setAlgoState] = useState<SamplerKey>('mh')
  const [rho, setRhoState] = useState(0.8)
  const [step, setStep] = useState(0.5)
  const [leap, setLeap] = useState(12)
  const [running, setRunning] = useState(false)
  const [samples, setSamples] = useState(0)
  const [accepts, setAccepts] = useState(0)

  const chainRef = useRef<Point[]>([[0, 0]])
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)
  const traceElRef = useRef<HTMLCanvasElement | null>(null)
  const countsRef = useRef({ samples: 0, accepts: 0 })
  const frameRef = useRef(0)
  const rafRef = useRef<number>()

  // Mirrors current control values into a ref so the rAF loop always reads
  // the latest settings without needing to be recreated every render.
  const liveRef = useRef({ target, algo, rho, step, leap, running })
  liveRef.current = { target, algo, rho, step, leap, running }

  const redraw = useCallback(() => {
    const t = getTarget(liveRef.current.target, { rho: liveRef.current.rho })
    drawDensityPanel(canvasElRef.current, t, chainRef.current)
    drawTracePanel(traceElRef.current, chainRef.current)
  }, [])

  const setCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasElRef.current = el
      redraw()
    },
    [redraw]
  )
  const setTraceRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      traceElRef.current = el
      redraw()
    },
    [redraw]
  )

  useEffect(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      frameRef.current++
      const live = liveRef.current
      if (!live.running) return

      const targetObj = getTarget(live.target, { rho: live.rho })
      for (let i = 0; i < STEPS_PER_FRAME; i++) {
        const cur = chainRef.current[chainRef.current.length - 1]
        const res = runStep(live.algo, targetObj, cur, live.step, live.leap)
        if (res.intermediate) {
          chainRef.current.push(res.intermediate)
          if (chainRef.current.length > MAX_CHAIN_LENGTH) chainRef.current.shift()
        }
        chainRef.current.push(res.next)
        if (chainRef.current.length > MAX_CHAIN_LENGTH) chainRef.current.shift()
        countsRef.current.samples++
        if (res.accepted) countsRef.current.accepts++
      }
      redraw()
      if (frameRef.current % DISPLAY_THROTTLE_FRAMES === 0) {
        setSamples(countsRef.current.samples)
        setAccepts(countsRef.current.accepts)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [redraw])

  const resetChain = useCallback(() => {
    chainRef.current = [[0, 0]]
    countsRef.current = { samples: 0, accepts: 0 }
    setSamples(0)
    setAccepts(0)
    redraw()
  }, [redraw])

  const setTarget = useCallback(
    (key: TargetKey) => {
      liveRef.current.target = key
      setTargetState(key)
      if (key !== 'gaussian') {
        liveRef.current.rho = 0.8
        setRhoState(0.8)
      }
      resetChain()
    },
    [resetChain]
  )

  const setAlgo = useCallback(
    (key: SamplerKey) => {
      liveRef.current.algo = key
      setAlgoState(key)
      resetChain()
    },
    [resetChain]
  )

  const setRho = useCallback(
    (value: number) => {
      liveRef.current.rho = value
      setRhoState(value)
      resetChain()
    },
    [resetChain]
  )

  const acceptRate = samples ? Math.round((100 * accepts) / samples) : 0

  return {
    target,
    algo,
    rho,
    step,
    leap,
    running,
    samples,
    acceptRate,
    setCanvasRef,
    setTraceRef,
    targetOptions: TARGET_OPTIONS.map((k) => ({ key: k, label: TARGET_LABELS[k] })),
    algoOptions: ALGO_OPTIONS.map((k) => ({ key: k, label: ALGO_LABELS[k] })),
    showRhoSlider: target === 'gaussian',
    showLeapSlider: algo === 'hmc' || algo === 'nuts',
    algoLabel: ALGO_LABELS[algo],
    algoTag: ALGO_TAGS[algo],
    algoDescription: ALGO_DESCRIPTIONS[algo],
    setTarget,
    setAlgo,
    setRho,
    setStep,
    setLeap,
    toggleRunning: () => setRunning((r) => !r),
    reset: resetChain,
  }
}
