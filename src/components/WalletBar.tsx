import { ConnectKitButton } from 'connectkit'
import { erc20Abi } from 'viem'
import { arcTestnet } from 'viem/chains'
import { useAccount, useReadContract } from 'wagmi'
import { TokenUSDC } from '@web3icons/react'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'

const CHAIN_ID = arcTestnet.id
const usdc = getUsdc(CHAIN_ID)

function UsdcBalance({ address }: { address: `0x${string}` }) {
  const { data, isLoading } = useReadContract({
    address: usdc?.address as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address],
    chainId: CHAIN_ID,
    query: { enabled: Boolean(usdc), refetchInterval: 10_000 },
  })
  const text =
    data === undefined ? (isLoading ? '...' : '--') : Amount.fromRaw(data, usdcDecimalsFor(CHAIN_ID)).toFixed(2)
  return (
    <div className="flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3.5">
      <TokenUSDC variant="branded" size={20} />
      <span className="display text-[15px] font-semibold tabular-nums">{text}</span>
      <span className="text-xs font-medium text-[var(--muted)]">USDC</span>
    </div>
  )
}

export default function WalletBar() {
  const { address } = useAccount()
  return (
    <div className="flex items-center gap-2">
      {address && <UsdcBalance address={address} />}
      <ConnectKitButton.Custom>
        {({ isConnected, show, truncatedAddress }) => (
          <button
            onClick={show}
            className="h-11 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.97]"
          >
            {isConnected ? truncatedAddress : 'Connect wallet'}
          </button>
        )}
      </ConnectKitButton.Custom>
    </div>
  )
}
