import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import GameCanvas from '@/components/GameCanvas'
import Hud from '@/components/Hud'
import Overlay from '@/components/Overlay'
import PlayBalance from '@/components/PlayBalance'
import { coinsToUsdc } from '@/lib/money'
import { getCharacter } from '@/game/characters'
import type { Character } from '@/game/characters'
import type { RunStats } from '@/game/types'

type Screen = 'menu' | 'playing' | 'over'

const BEST_KEY = 'temple-dash-best-coins'
const CHARACTER_KEY = 'temple-grab-character'
const TOTAL_KEY = 'temple-grab-play-coins'
const readTotal = () => Number(localStorage.getItem(TOTAL_KEY) ?? 0) || 0
const readBest = () => Number(localStorage.getItem(BEST_KEY) ?? 0) || 0
const readCharacter = () => getCharacter(localStorage.getItem(CHARACTER_KEY))

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [runId, setRunId] = useState(0)
  const [live, setLive] = useState<RunStats>({ coins: 0, distance: 0 })
  const [last, setLast] = useState<RunStats>({ coins: 0, distance: 0 })
  const [best, setBest] = useState(readBest)
  const [newBest, setNewBest] = useState(false)
  const [sessionCoins, setSessionCoins] = useState(0)
  const [totalCoins, setTotalCoins] = useState(readTotal)
  const [character, setCharacter] = useState<Character>(readCharacter)

  const selectCharacter = useCallback((c: Character) => {
    setCharacter(c)
    localStorage.setItem(CHARACTER_KEY, c.id)
  }, [])

  const start = useCallback(() => {
    setLive({ coins: 0, distance: 0 })
    setScreen('playing')
    setRunId((n) => n + 1)
  }, [])

  const onGameOver = useCallback(
    (s: RunStats) => {
      const isBest = s.coins > best
      setLast(s)
      setSessionCoins((n) => n + s.coins)
      const nextTotal = totalCoins + s.coins
      setTotalCoins(nextTotal)
      localStorage.setItem(TOTAL_KEY, String(nextTotal))
      setNewBest(isBest)
      if (isBest) {
        setBest(s.coins)
        localStorage.setItem(BEST_KEY, String(s.coins))
      }
      setScreen('over')
    },
    [best, totalCoins],
  )

  useEffect(() => {
    if (screen === 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, start])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-3 px-4 pb-20 pt-4">
      <header className="flex items-center justify-between gap-2">
        <div className="display text-xl font-bold">Temple Grab</div>
        <PlayBalance coins={totalCoins} />
      </header>

      <main className="relative aspect-[9/14] max-h-[calc(100dvh-170px)] min-h-[420px] w-full overflow-hidden rounded-3xl border border-[var(--border)] bg-[#fdeccf] shadow-[0_20px_50px_-20px_rgba(18,45,69,0.35)]">
        <GameCanvas character={character} runId={runId} onStats={setLive} onGameOver={onGameOver} />
        {screen === 'playing' && <Hud coins={live.coins} distance={live.distance} />}
        <AnimatePresence>
          {screen !== 'playing' && (
            <Overlay
              key={screen}
              character={character}
              onSelect={selectCharacter}
              dead={screen === 'over'}
              last={last}
              bestCoins={best}
              newBest={newBest}
              onStart={start}
            />
          )}
        </AnimatePresence>
      </main>

      <section className="grid grid-cols-2 gap-2">
        <Stat label="Best run" value={coinsToUsdc(best)} />
        <Stat label="This session" value={coinsToUsdc(sessionCoins)} />
      </section>
      <p className="text-pretty text-center text-xs text-[var(--muted)]">
        Play USDC is just for fun. Each coin adds 0.01 to your play balance, saved in this browser. No wallet is needed and no real tokens are involved.
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 backdrop-blur">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div>
      <div className="display text-xl font-bold tabular-nums">
        {value} <span className="text-xs font-semibold text-[var(--muted)]">USDC</span>
      </div>
    </div>
  )
}
