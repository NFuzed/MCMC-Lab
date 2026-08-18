import { useCallback, useEffect, useRef, useState } from 'react'
import { getTarget, TARGET_LABELS } from '../../models/targets'
import { runStep } from '../../models/samplers'
import { drawDensityPanel } from '../../models/canvasRender'
import type { Point, SamplerKey, TargetKey } from '../../models/types'

const TARGET_OPTIONS: TargetKey[] = ['gaussian', 'bimodal', 'banana']
const SAMPLER_CONFIG: Record<SamplerKey, { step: number; leap?: number }> = {
  mh: { step: 0.5 },
  gibbs: { step: 0.7 },
  hmc: { step: 0.5, leap: 15 },
  nuts: { step: 0.5 },
}
const SAMPLER_KEYS = Object.keys(SAMPLER_CONFIG) as SamplerKey[]
const STEPS_PER_FRAME = 3
const MAX_CHAIN_LENGTH = 3000
const DISPLAY_THROTTLE_FRAMES = 4

function emptyChains(): Record<SamplerKey, Point[]> {
  return { mh: [[0, 0]], gibbs: [[0, 0]], hmc: [[0, 0]], nuts: [[0, 0]] }
}
function zeroCounts(): Record<SamplerKey, number> {
  return { mh: 0, gibbs: 0, hmc: 0, nuts: 0 }
}

export function useCompare() {
  const [pgTarget, setPgTargetState] = useState<TargetKey>('bimodal')
  const [running, setRunning] = useState(false)
  const [samples, setSamples] = useState(zeroCounts())
  const [accepts, setAccepts] = useState(zeroCounts())

  const chainsRef = useRef<Record<SamplerKey, Point[]>>(emptyChains())
  const canvasElRefs = useRef<Partial<Record<SamplerKey, HTMLCanvasElement | null>>>({})
  const countsRef = useRef({ samples: zeroCounts(), accepts: zeroCounts() })
  const frameRef = useRef(0)
  const rafRef = useRef<number>()
  const liveRef = useRef({ pgTarget, running })
  liveRef.current = { pgTarget, running }

  const redrawOne = useCallback((key: SamplerKey) => {
    const target = getTarget(liveRef.current.pgTarget, {})
    drawDensityPanel(canvasElRefs.current[key] ?? null, target, chainsRef.current[key])
  }, [])

  const redrawAll = useCallback(() => {
    SAMPLER_KEYS.forEach(redrawOne)
  }, [redrawOne])

  const setCanvasRefMh = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasElRefs.current.mh = el
      redrawOne('mh')
    },
    [redrawOne]
  )
  const setCanvasRefGibbs = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasElRefs.current.gibbs = el
      redrawOne('gibbs')
    },
    [redrawOne]
  )
  const setCanvasRefHmc = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasElRefs.current.hmc = el
      redrawOne('hmc')
    },
    [redrawOne]
  )
  const setCanvasRefNuts = useCallback(
    (el: HTMLCanvasElement | null) => {
      canvasElRefs.current.nuts = el
      redrawOne('nuts')
    },
    [redrawOne]
  )

  useEffect(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      frameRef.current++
      if (!liveRef.current.running) return

      const target = getTarget(liveRef.current.pgTarget, {})
      SAMPLER_KEYS.forEach((key) => {
        const cfg = SAMPLER_CONFIG[key]
        const chain = chainsRef.current[key]
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          const cur = chain[chain.length - 1]
          const res = runStep(key, target, cur, cfg.step, cfg.leap)
          if (res.intermediate) {
            chain.push(res.intermediate)
            if (chain.length > MAX_CHAIN_LENGTH) chain.shift()
          }
          chain.push(res.next)
          if (chain.length > MAX_CHAIN_LENGTH) chain.shift()
          countsRef.current.samples[key]++
          if (res.accepted) countsRef.current.accepts[key]++
        }
        redrawOne(key)
      })

      if (frameRef.current % DISPLAY_THROTTLE_FRAMES === 0) {
        setSamples({ ...countsRef.current.samples })
        setAccepts({ ...countsRef.current.accepts })
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [redrawOne])

  const reset = useCallback(() => {
    chainsRef.current = emptyChains()
    countsRef.current = { samples: zeroCounts(), accepts: zeroCounts() }
    setSamples(zeroCounts())
    setAccepts(zeroCounts())
    redrawAll()
  }, [redrawAll])

  const setPgTarget = useCallback(
    (key: TargetKey) => {
      liveRef.current.pgTarget = key
      setPgTargetState(key)
      reset()
    },
    [reset]
  )

  const acceptRate = (key: SamplerKey) => (samples[key] ? Math.round((100 * accepts[key]) / samples[key]) : 0)

  return {
    pgTarget,
    running,
    targetOptions: TARGET_OPTIONS.map((k) => ({ key: k, label: TARGET_LABELS[k] })),
    setPgTarget,
    toggleRunning: () => setRunning((r) => !r),
    reset,
    setCanvasRefMh,
    setCanvasRefGibbs,
    setCanvasRefHmc,
    setCanvasRefNuts,
    samplesMh: samples.mh,
    acceptMh: acceptRate('mh'),
    samplesGibbs: samples.gibbs,
    acceptGibbs: acceptRate('gibbs'),
    samplesHmc: samples.hmc,
    acceptHmc: acceptRate('hmc'),
    samplesNuts: samples.nuts,
    acceptNuts: acceptRate('nuts'),
  }
}
