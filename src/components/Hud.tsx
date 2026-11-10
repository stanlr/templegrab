import { TokenUSDC } from '@web3icons/react'
import { coinsToUsdc } from '@/lib/money'

interface Props {
  coins: number
  distance: number
}

export default function Hud({ coins, distance }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
      <div className="flex items-center gap-2.5 rounded-2xl bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
        <TokenUSDC variant="branded" size={28} />
        <div className="leading-tight">
          <div className="display text-xl font-bold tabular-nums">{coinsToUsdc(coins)}</div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
            {coins} {coins === 1 ? 'coin' : 'coins'}
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-white/80 px-3 py-2 text-right shadow-sm backdrop-blur">
        <div className="display text-xl font-bold tabular-nums">{distance}</div>
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">meters</div>
      </div>
    </div>
  )
}
