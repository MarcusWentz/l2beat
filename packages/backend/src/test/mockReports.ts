import {
  AssetId,
  ChainId,
  EthereumAddress,
  ProjectId,
  Token,
  UnixTime,
} from '@l2beat/shared-pure'

import { aggregateReports } from '../core/reports/aggregateReports'
import { createReports } from '../core/reports/createReports'
import { OP_TOKEN_ID } from '../core/reports/custom/optimism'
import { ReportProject } from '../core/reports/ReportProject'
import { BalanceRecord } from '../peripherals/database/BalanceRepository'
import { PriceRecord } from '../peripherals/database/PriceRepository'
import { ReportRecord } from '../peripherals/database/ReportRepository'
import { getMockToken } from './token'

const NOW = UnixTime.now().toStartOf('hour')
const APEX_ESCROW_ONE = EthereumAddress.random()
const APEX_ESCROW_TWO = EthereumAddress.random()
const DYDX_ESCROW = EthereumAddress.random()

const PROJECTS: ReportProject[] = [
  {
    projectId: ProjectId('apex'),
    type: 'layer2',
    escrows: [
      {
        address: APEX_ESCROW_ONE,
        sinceTimestamp: new UnixTime(0),
        tokens: [fakeToken({ id: AssetId.DAI, decimals: 18 })],
      },
      {
        address: APEX_ESCROW_TWO,
        sinceTimestamp: new UnixTime(0),
        tokens: [
          fakeToken({ id: AssetId.DAI, decimals: 18 }),
          fakeToken({ id: AssetId.ETH, decimals: 18 }),
        ],
      },
    ],
  },
  {
    projectId: ProjectId('dydx'),
    type: 'layer2',
    escrows: [
      {
        address: DYDX_ESCROW,
        sinceTimestamp: new UnixTime(0),
        tokens: [fakeToken({ id: AssetId.ETH, decimals: 18 })],
      },
    ],
  },
]

const PRICES: PriceRecord[] = [
  { priceUsd: 1, assetId: AssetId.DAI, timestamp: NOW },
  { priceUsd: 1000, assetId: AssetId.ETH, timestamp: NOW },
]

const FUTURE_PRICES = PRICES.map((price) => ({
  ...price,
  timestamp: NOW.add(1, 'hours'),
}))
FUTURE_PRICES.push({
  priceUsd: 1000,
  assetId: OP_TOKEN_ID,
  timestamp: NOW.add(1, 'hours'),
})

const BALANCES: BalanceRecord[] = [
  {
    timestamp: NOW,
    assetId: AssetId.DAI,
    holderAddress: APEX_ESCROW_ONE,
    balance: 2_000n * 10n ** 18n,
    chainId: ChainId.ETHEREUM,
  },
  {
    timestamp: NOW,
    assetId: AssetId.DAI,
    holderAddress: APEX_ESCROW_TWO,
    balance: 3_000n * 10n ** 18n,
    chainId: ChainId.ETHEREUM,
  },
  {
    timestamp: NOW,
    assetId: AssetId.ETH,
    holderAddress: APEX_ESCROW_TWO,
    balance: 30n * 10n ** 18n,
    chainId: ChainId.ETHEREUM,
  },
  {
    timestamp: NOW,
    assetId: AssetId.ETH,
    holderAddress: DYDX_ESCROW,
    balance: 20n * 10n ** 18n,
    chainId: ChainId.ETHEREUM,
  },
]

const FUTURE_BALANCES = BALANCES.map((balance) => ({
  ...balance,
  timestamp: NOW.add(1, 'hours'),
}))

const REPORTS = createReports(PRICES, BALANCES, PROJECTS, ChainId.ETHEREUM)
const FUTURE_REPORTS = createReports(
  FUTURE_PRICES,
  FUTURE_BALANCES,
  PROJECTS,
  ChainId.ETHEREUM,
)

const FUTURE_OP_REPORT: ReportRecord[] = [
  {
    asset: OP_TOKEN_ID,
    reportType: 'NMV',
    chainId: ChainId.NMV,
    amount: 716708907000000000000000000n,
    ethValue: 716708907000000n,
    usdValue: 71670890700000n,
    timestamp: NOW.add(1, 'hours'),
    projectId: ProjectId.OPTIMISM,
  },
]
const FUTURE_REPORTS_WITH_OP = [...FUTURE_REPORTS, ...FUTURE_OP_REPORT]

const AGGREGATED_REPORTS = aggregateReports(REPORTS, PROJECTS, NOW)
const FUTURE_AGGREGATE_REPORTS_WITH_NATIVE_OP = aggregateReports(
  FUTURE_REPORTS_WITH_OP,
  PROJECTS,
  NOW.add(1, 'hours'),
)

export function fakeToken(token: Partial<Token>): Token {
  return {
    ...getMockToken(),
    ...token,
  }
}

export const REPORTS_MOCK = {
  NOW,
  PROJECTS,
  PRICES,
  BALANCES,
  REPORTS,
  AGGREGATED_REPORTS,
  FUTURE_PRICES,
  FUTURE_BALANCES,
  FUTURE_OP_REPORT,
  FUTURE_REPORTS,
  FUTURE_AGGREGATE_REPORTS_WITH_NATIVE_OP,
}
