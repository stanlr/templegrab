import { TokenUSDC } from '@web3icons/react'
import { coinsToUsdc } from '@/lib/money'

export default function PlayBalance({ coins }: { coins: number }) {
  return (
    <div className="flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3.5">
      <TokenUSDC variant="branded" size={20} />
      <span className="display text-[15px] font-semibold tabular-nums">{coinsToUsdc(coins)}</span>
      <span className="text-xs font-medium text-[var(--muted)]">play USDC</span>
    </div>
  )
}
