import { Currency, TransactionType } from '@prisma/client'
import { WalletService } from './wallet.service'

function memoryWallet(inrBalance: number, inrLocked: number) {
  const wallet = {
    id: 'w1',
    userId: 'u1',
    inrBalance,
    inrLocked,
    usdtBalance: 0,
    usdtLocked: 0,
    btcBalance: 0,
    btcLocked: 0,
  }
  const db = {
    wallet: {
      findFirst: async () => ({ ...wallet }),
      create: async () => ({ ...wallet }),
      update: async ({ data }: { data: Record<string, number> }) => {
        if (typeof data.inrBalance === 'number') wallet.inrBalance = data.inrBalance
        if (typeof data.inrLocked === 'number') wallet.inrLocked = data.inrLocked
        return { ...wallet }
      },
    },
    ledgerEntry: {
      create: async ({ data }: { data: unknown }) => data,
    },
  }
  return {
    wallet,
    service: new WalletService({ ...db, $transaction: async (fn: (client: typeof db) => Promise<unknown>) => fn(db) } as any),
  }
}

describe('sports exposure wallet', () => {
  it('locks the stake at bet time, releases it on a loss, and pays the return on a win', async () => {
    const lost = memoryWallet(1000, 0)
    await lost.service.createTransaction('u1', Currency.INR, 100, TransactionType.bet, 'bet-loss')
    expect(lost.wallet).toMatchObject({ inrBalance: 900, inrLocked: 100 })
    await lost.service.createTransaction('u1', Currency.INR, 100, TransactionType.loss, 'bet-loss')
    expect(lost.wallet).toMatchObject({ inrBalance: 900, inrLocked: 0 })

    const won = memoryWallet(1000, 0)
    await won.service.createTransaction('u1', Currency.INR, 100, TransactionType.bet, 'bet-win')
    await won.service.createTransaction('u1', Currency.INR, 190, TransactionType.win, 'bet-win', { unlockAmount: 100 })
    expect(won.wallet).toMatchObject({ inrBalance: 1090, inrLocked: 0 })
  })
})
