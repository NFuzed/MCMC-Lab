import { useCallback, useEffect, useRef, useState } from 'react'
import { getTarget, TARGET_LABELS } from '../../models/targets'
import { DEFAULT_GAMMA, initPopulation, populationStep } from '../../models/populationSampler'
import { DEFAULT_A, emceeStep, initEnsemble } from '../../models/emceeSampler'
import { drawEnsemblePanel } from '../../models/canvasRender'
import type { Point, TargetKey } from '../../models/types'

const TARGET_OPTIONS: TargetKey[] = ['gaussian', 'bimodal', 'banana']
const WALKER_COUNT = 24
const INIT_SPREAD = 1
const SWEEPS_PER_FRAME = 2
const DISPLAY_THROTTLE_FRAMES = 4

export function useEnsembles() {
  const [target, setTargetState] = useState<TargetKey>('bimodal')
  const [running, setRunning] = useState(false)
  const [popGenerations, setPopGenerations] = useState(0)
  const [popAccepts, setPopAccepts] = useState(0)
  const [emceeGenerations, setEmceeGenerations] = useState(0)
  const [emceeAccepts, setEmceeAccepts] = useState(0)

  // Lazily seeded once on mount rather than on every render, since the
  // initializer draws WALKER_COUNT random points.
  const popWalkersRef = useRef<Point[]>()
  if (!popWalkersRef.current) popWalkersRef.current = initPopulation([0, 0], WALKER_COUNT, INIT_SPREAD)
  const emceeWalkersRef = useRef<Point[]>()
  if (!emceeWalkersRef.current) emceeWalkersRef.current = initEnsemble([0, 0], WALKER_COUNT, INIT_SPREAD)

  const popCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const emceeCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const countsRef = useRef({ popGenerations: 0, popAccepts: 0, emceeGenerations: 0, emceeAccepts: 0 })
  const frameRef = useRef(0)
  const rafRef = useRef<number>()
  const liveRef = useRef({ target, running })
  liveRef.current = { target, running }

  const redrawPop = useCallback(() => {
    const t = getTarget(liveRef.current.target, {})
    drawEnsemblePanel(popCanvasRef.current, t, popWalkersRef.current!)
  }, [])
  const redrawEmcee = useCallback(() => {
    const t = getTarget(liveRef.current.target, {})
    drawEnsemblePanel(emceeCanvasRef.current, t, emceeWalkersRef.current!)
  }, [])

  const setPopCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      popCanvasRef.current = el
      redrawPop()
    },
    [redrawPop]
  )
  const setEmceeCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      emceeCanvasRef.current = el
      redrawEmcee()
    },
    [redrawEmcee]
  )

  useEffect(() => {
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop)
      frameRef.current++
      if (!liveRef.current.running) return

      const targetObj = getTarget(liveRef.current.target, {})
      for (let i = 0; i < SWEEPS_PER_FRAME; i++) {
        const popRes = populationStep(targetObj, popWalkersRef.current!, DEFAULT_GAMMA)
        popWalkersRef.current = popRes.next
        countsRef.current.popGenerations++
        countsRef.current.popAccepts += popRes.acceptedCount

        const emceeRes = emceeStep(targetObj, emceeWalkersRef.current!, DEFAULT_A)
        emceeWalkersRef.current = emceeRes.next
        countsRef.current.emceeGenerations++
        countsRef.current.emceeAccepts += emceeRes.acceptedCount
      }
      redrawPop()
      redrawEmcee()

      if (frameRef.current % DISPLAY_THROTTLE_FRAMES === 0) {
        setPopGenerations(countsRef.current.popGenerations)
        setPopAccepts(countsRef.current.popAccepts)
        setEmceeGenerations(countsRef.current.emceeGenerations)
        setEmceeAccepts(countsRef.current.emceeAccepts)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [redrawPop, redrawEmcee])

  const reset = useCallback(() => {
    popWalkersRef.current = initPopulation([0, 0], WALKER_COUNT, INIT_SPREAD)
    emceeWalkersRef.current = initEnsemble([0, 0], WALKER_COUNT, INIT_SPREAD)
    countsRef.current = { popGenerations: 0, popAccepts: 0, emceeGenerations: 0, emceeAccepts: 0 }
    setPopGenerations(0)
    setPopAccepts(0)
    setEmceeGenerations(0)
    setEmceeAccepts(0)
    redrawPop()
    redrawEmcee()
  }, [redrawPop, redrawEmcee])

  const setTarget = useCallback(
    (key: TargetKey) => {
      liveRef.current.target = key
      setTargetState(key)
      reset()
    },
    [reset]
  )

  const popAcceptRate = popGenerations ? Math.round((100 * popAccepts) / (popGenerations * WALKER_COUNT)) : 0
  const emceeAcceptRate = emceeGenerations ? Math.round((100 * emceeAccepts) / (emceeGenerations * WALKER_COUNT)) : 0

  return {
    target,
    running,
    targetOptions: TARGET_OPTIONS.map((k) => ({ key: k, label: TARGET_LABELS[k] })),
    setTarget,
    toggleRunning: () => setRunning((r) => !r),
    reset,
    setPopCanvasRef,
    setEmceeCanvasRef,
    walkerCount: WALKER_COUNT,
    popGenerations,
    popAcceptRate,
    emceeGenerations,
    emceeAcceptRate,
  }
}
