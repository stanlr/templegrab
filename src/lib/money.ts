import { USDC_DECIMALS } from '@/onchain-facts'
import { formatUnitsFixed, parseUsdc } from '@/onchain-money'

/** Each collected coin is worth 0.01 USDC. */
const COIN_VALUE = parseUsdc('0.01')

export function coinsToUsdc(coins: number): string {
  return formatUnitsFixed(COIN_VALUE * BigInt(coins), USDC_DECIMALS, 2)
}
