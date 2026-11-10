import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { CHARACTERS } from '@/game/characters'
import type { Character } from '@/game/characters'
import { drawRunner } from '@/game/runner'
import type { View } from '@/game/types'

const W = 56
const H = 80

function Portrait({ character }: { character: Character }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const view: View = { ctx, W, H, cx: W / 2, horizon: 8, ground: H - 4, laneW: 40, unit: 38 }
    drawRunner(view, { x: 0, y: 0, sliding: false, phase: 0.6, lean: 0, dead: 0 }, character)
  }, [character])

  return <canvas ref={ref} style={{ width: W, height: H }} aria-hidden="true" />
}

interface Props {
  selected: Character
  onSelect: (c: Character) => void
}

export default function CharacterPicker({ selected, onSelect }: Props) {
  return (
    <div role="radiogroup" aria-label="Choose your runner" className="grid grid-cols-4 gap-2">
      {CHARACTERS.map((c) => {
        const active = c.id === selected.id
        return (
          <button
            key={c.id}
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(c)}
            className={`relative flex min-h-[44px] flex-col items-center rounded-2xl border px-1 pb-2 pt-2 transition active:scale-[0.97] ${
              active
                ? 'border-[var(--accent)] bg-white shadow-md'
                : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-white'
            }`}
          >
            {active && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-white">
                <Check size={10} strokeWidth={3} />
              </span>
            )}
            <Portrait character={c} />
            <span className="display mt-1 text-[13px] font-bold leading-none">{c.name}</span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
              {c.role}
            </span>
          </button>
        )
      })}
    </div>
  )
}
