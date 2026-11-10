import { motion } from 'framer-motion'
import { ArrowLeftRight, ArrowUp, ArrowDown, Play, RotateCcw } from 'lucide-react'
import { TokenUSDC } from '@web3icons/react'
import { coinsToUsdc } from '@/lib/money'
import CharacterPicker from '@/components/CharacterPicker'
import type { Character } from '@/game/characters'
import type { RunStats } from '@/game/types'

interface Props {
  character: Character
  onSelect: (c: Character) => void
  dead: boolean
  last: RunStats
  bestCoins: number
  newBest: boolean
  onStart: () => void
}

const hints = [
  { icon: ArrowLeftRight, label: 'Switch lanes', sub: 'Left / right' },
  { icon: ArrowUp, label: 'Jump stones', sub: 'Up / space' },
  { icon: ArrowDown, label: 'Slide under beams', sub: 'Down' },
]

export default function Overlay({ character, onSelect, dead, last, bestCoins, newBest, onStart }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-end justify-center bg-[#122d45]/25 p-3 backdrop-blur-[2px]"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="max-h-full w-full max-w-sm overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-xl backdrop-blur-xl"
      >
        {dead ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
              {newBest ? 'New best run' : 'You crashed'}
            </div>
            <div className="mt-1 flex items-center gap-2.5">
              <TokenUSDC variant="branded" size={36} />
              <div className="display text-5xl font-bold tabular-nums">{coinsToUsdc(last.coins)}</div>
              <div className="mt-3 text-sm font-semibold text-[var(--muted)]">USDC</div>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              {last.coins} coins over {last.distance} m. Best run: {coinsToUsdc(bestCoins)} USDC.
            </p>
          </>
        ) : (
          <>
            <h1 className="display text-balance text-3xl font-bold">Temple Grab</h1>
            <p className="mt-1 text-pretty text-sm text-[var(--ink-2)]">
              Sprint through the ruins and grab play USDC coins worth 0.01 each. Dodge the stones, pillars and beams.
            </p>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {hints.map(({ icon: Icon, label, sub }) => (
                <li key={label} className="rounded-2xl bg-[var(--surface-muted)] p-2">
                  <Icon size={16} className="text-[var(--accent)]" />
                  <div className="mt-1 text-xs font-semibold leading-tight">{label}</div>
                  <div className="text-[11px] text-[var(--muted)]">{sub}</div>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="mb-2 mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          Choose your runner
        </div>
        <CharacterPicker selected={character} onSelect={onSelect} />
        <button
          onClick={onStart}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-[15px] font-semibold text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.98]"
        >
          {dead ? <RotateCcw size={18} /> : <Play size={18} />}
          {dead ? `Run again as ${character.name}` : `Start running as ${character.name}`}
        </button>
        <p className="mt-2 text-center text-[11px] text-[var(--muted)]">Press Enter to start. Swipe on touch screens.</p>
      </motion.div>
    </motion.div>
  )
}
