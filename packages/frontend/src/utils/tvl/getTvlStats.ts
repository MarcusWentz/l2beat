import {
  ChainId,
  DetailedTvlApiProject,
  DetailedTvlApiToken,
  TvlApiProject,
  TvlApiToken,
} from '@l2beat/shared-pure'

import { getPercentageChange } from '../utils'
import { getTvlBreakdown } from './getTVLBreakdown'

export type TvlStats = ReturnType<typeof getTvlStats>

export function getTvlStats(
  tvlProject: TvlApiProject | DetailedTvlApiProject,
  name: string,
  associatedTokens: string[],
) {
  const aggregate = tvlProject.charts.hourly.data
  const tvl = aggregate.at(-1)?.[1] ?? 0
  const tvlOneDayAgo = aggregate.at(-25)?.[1] ?? 0
  // This assumes that hourly data spans exactly 7 days
  const tvlSevenDaysAgo = aggregate.at(0)?.[1] ?? 0

  return {
    tvl,
    tvlBreakdown: getTvlBreakdown(
      name,
      associatedTokens,
      tvl,
      unifyTokensResponse(tvlProject.tokens),
    ),
    oneDayChange: getPercentageChange(tvl, tvlOneDayAgo),
    sevenDayChange: getPercentageChange(tvl, tvlSevenDaysAgo),
  }
}

/**
 * Backwards compatibility for classic TVL API response
 * @notice Remove once classic TVL API is deprecated
 */
export function unifyTokensResponse(
  tokens?: TvlApiToken[] | DetailedTvlApiProject['tokens'],
): DetailedTvlApiToken[] {
  if (!tokens) {
    return []
  }

  if (Array.isArray(tokens)) {
    return tokens.map((token) => ({
      assetId: token.assetId,
      chainId: ChainId.ETHEREUM,
      usdValue: token.tvl,
      assetType: 'CBV',
    }))
  }

  return Object.values(tokens)
    .flat()
    .map((token) => ({
      assetId: token.assetId,
      chainId: token.chainId,
      assetType: token.assetType,
      usdValue: token.usdValue,
    }))
}
