import { useEffect, useRef } from 'react'
import { RunnerGame } from '@/game/engine'
import type { Character } from '@/game/characters'
import type { Action, RunStats } from '@/game/types'

interface Props {
  character: Character
  runId: number
  onStats: (s: RunStats) => void
  onGameOver: (s: RunStats) => void
}

const KEYS: Record<string, Action> = {
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  ArrowUp: 'jump',
  w: 'jump',
  W: 'jump',
  ' ': 'jump',
  ArrowDown: 'slide',
  s: 'slide',
  S: 'slide',
}

export default function GameCanvas({ character, runId, onStats, onGameOver }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<RunnerGame | null>(null)
  const handlers = useRef({ onStats, onGameOver })
  useEffect(() => {
    handlers.current = { onStats, onGameOver }
  })

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const engine = new RunnerGame(canvas, {
      onStats: (s) => handlers.current.onStats(s),
      onGameOver: (s) => handlers.current.onGameOver(s),
    })
    engineRef.current = engine

    const fit = () => {
      const r = wrap.getBoundingClientRect()
      engine.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 2))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const onKey = (e: KeyboardEvent) => {
      const action = KEYS[e.key]
      if (!action) return
      e.preventDefault()
      engine.input(action)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      ro.disconnect()
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    engineRef.current?.setCharacter(character)
  }, [character])

  useEffect(() => {
    if (runId > 0) engineRef.current?.start()
  }, [runId])

  const touch = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    touch.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const t = touch.current
    touch.current = null
    if (!t) return
    const dx = e.clientX - t.x
    const dy = e.clientY - t.y
    const engine = engineRef.current
    if (!engine) return
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) engine.input('jump')
    else if (Math.abs(dx) > Math.abs(dy)) engine.input(dx > 0 ? 'right' : 'left')
    else engine.input(dy < 0 ? 'jump' : 'slide')
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
    </div>
  )
}
