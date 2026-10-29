import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toNum } from '../common/utils/prisma-decimal';

export type BetHistorySource = 'all' | 'sports' | 'game';
export type BetHistoryOrder = 'asc' | 'desc';

export type BetHistoryItem = {
  id: string;
  source: 'sports' | 'game';
  userId: string;
  username: string;
  playedAt: string;
  game: string;
  prediction: string;
  outcome: string;
  detail: string;
  amount: number;
  currency: string;
  odds: number | null;
  payout: number;
  status: string;
};

export type BetHistoryResponse = {
  items: BetHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  order: BetHistoryOrder;
  summary: {
    total: number;
    totalStake: number;
    totalPayout: number;
    open: number;
  };
};

const GAME_LABELS: Record<string, string> = {
  dice: 'Dice',
  crash: 'Crash',
  mines: 'Mines',
  plinko: 'Plinko',
  roulette: 'Roulette',
  blackjack: 'Blackjack',
  baccarat: 'Baccarat',
  slots: 'Slots',
  wheel: 'Wheel',
  tower: 'Tower',
  limbo: 'Limbo',
  coinflip: 'Coin Flip',
  keno: 'Keno',
  scratch: 'Scratch',
  dragon_tiger: 'Dragon Tiger',
  andar_bahar: 'Andar Bahar',
  video_poker: 'Video Poker',
  color_prediction: 'Color Prediction',
  hilo: 'Hi-Lo',
  number_hilo: 'Number Hi-Lo',
  poker: 'Poker',
  tic_tac_toe: 'Tic Tac Toe',
  sports: 'Sports',
};

@Injectable()
export class BetHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(opts: {
    userId?: string;
    page: number;
    pageSize: number;
    source: BetHistorySource;
    order: BetHistoryOrder;
  }): Promise<BetHistoryResponse> {
    const page = opts.page;
    const pageSize = opts.pageSize;
    const order = opts.order;
    const userId = opts.userId;
    const includeSports = opts.source !== 'game';
    const includeGames = opts.source !== 'sports';

    const sportsWhere = userId ? { userId } : {};
    const gameWhere = {
      ...(userId ? { userId } : {}),
      betAmount: { gt: 0 },
    };

    const [sportsCount, gamesCount, sportsSum, gamesSum, sportsGroups, gameGroups] = await Promise.all([
      includeSports ? this.prisma.sportsBet.count({ where: sportsWhere }) : Promise.resolve(0),
      includeGames ? this.prisma.gameSession.count({ where: gameWhere }) : Promise.resolve(0),
      includeSports
        ? this.prisma.sportsBet.aggregate({
            where: sportsWhere,
            _sum: { stake: true, payoutAmount: true },
          })
        : Promise.resolve(null),
      includeGames
        ? this.prisma.gameSession.aggregate({
            where: gameWhere,
            _sum: { betAmount: true, winAmount: true },
          })
        : Promise.resolve(null),
      includeSports
        ? this.prisma.sportsBet.groupBy({
            by: ['status'],
            where: sportsWhere,
            _count: { _all: true },
          })
        : Promise.resolve([]),
      includeGames
        ? this.prisma.gameSession.groupBy({
            by: ['status'],
            where: gameWhere,
            _count: { _all: true },
          })
        : Promise.resolve([]),
    ]);

    const total = sportsCount + gamesCount;
    const skip = (page - 1) * pageSize;
    const direction = order === 'asc' ? 'asc' : 'desc';

    let tagged: Array<{ at: number; kind: 'sports' | 'game'; row: any }> = [];

    if (includeSports && includeGames) {
      const window = skip + pageSize;
      const [sportsRows, gameRows] = await Promise.all([
        sportsCount
          ? this.prisma.sportsBet.findMany({
              where: sportsWhere,
              orderBy: { createdAt: direction },
              take: window,
            })
          : Promise.resolve([]),
        gamesCount
          ? this.prisma.gameSession.findMany({
              where: gameWhere,
              orderBy: { createdAt: direction },
              take: window,
              select: gameSelect,
            })
          : Promise.resolve([]),
      ]);
      tagged = [
        ...sportsRows.map((row) => ({ at: row.createdAt.getTime(), kind: 'sports' as const, row })),
        ...gameRows.map((row) => ({ at: row.createdAt.getTime(), kind: 'game' as const, row })),
      ].sort((a, b) => {
        const diff = order === 'asc' ? a.at - b.at : b.at - a.at;
        if (diff !== 0) return diff;
        return a.row.id < b.row.id ? -1 : 1;
      });
      tagged = tagged.slice(skip, skip + pageSize);
    } else if (includeSports) {
      const sportsRows = await this.prisma.sportsBet.findMany({
        where: sportsWhere,
        orderBy: { createdAt: direction },
        skip,
        take: pageSize,
      });
      tagged = sportsRows.map((row) => ({ at: row.createdAt.getTime(), kind: 'sports' as const, row }));
    } else {
      const gameRows = await this.prisma.gameSession.findMany({
        where: gameWhere,
        orderBy: { createdAt: direction },
        skip,
        take: pageSize,
        select: gameSelect,
      });
      tagged = gameRows.map((row) => ({ at: row.createdAt.getTime(), kind: 'game' as const, row }));
    }

    const userIds = [...new Set(tagged.map((entry) => String(entry.row.userId)))];
    const users = userIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, username: true },
        })
      : [];
    const names = new Map(users.map((user) => [user.id, user.username]));

    const sportsOpen = sportsGroups
      .filter((group) => String(group.status) === 'pending')
      .reduce((sum, group) => sum + group._count._all, 0);
    const gamesOpen = gameGroups
      .filter((group) => String(group.status) === 'pending' || String(group.status) === 'active')
      .reduce((sum, group) => sum + group._count._all, 0);

    return {
      items: tagged.map((entry) =>
        entry.kind === 'sports'
          ? this.mapSports(entry.row, names.get(entry.row.userId) || 'player')
          : this.mapGame(entry.row, names.get(entry.row.userId) || 'player'),
      ),
      total,
      page,
      pageSize,
      order,
      summary: {
        total,
        totalStake: toNum(sportsSum?._sum?.stake) + toNum(gamesSum?._sum?.betAmount),
        totalPayout: toNum(sportsSum?._sum?.payoutAmount) + toNum(gamesSum?._sum?.winAmount),
        open: sportsOpen + gamesOpen,
      },
    };
  }

  private mapSports(bet: any, username: string): BetHistoryItem {
    const meta = bet.meta && typeof bet.meta === 'object' ? bet.meta : {};
    const snap = meta.matchSnapshot && typeof meta.matchSnapshot === 'object' ? meta.matchSnapshot : {};
    const teams = snap.teamA && snap.teamB ? `${snap.teamA} vs ${snap.teamB}` : '';
    const market = meta.marketTitle || titleCase(String(bet.betType || 'selection').replace(/_/g, ' '));
    const pick = String(meta.optionLabel || bet.selection || 'Selection');
    const line = bet.line != null ? toNum(bet.line) : null;
    const pickText = line != null && !pick.includes(String(line)) ? `${pick} ${line}` : pick;
    const league = snap.league ? String(snap.league) : '';
    const status = String(bet.status || 'pending');
    const outcome =
      status === 'pending'
        ? 'Waiting for result'
        : status === 'won'
          ? 'Won'
          : status === 'lost'
            ? 'Lost'
            : status === 'void'
              ? 'Void'
              : titleCase(status);

    return {
      id: bet.id,
      source: 'sports',
      userId: bet.userId,
      username,
      playedAt: bet.createdAt.toISOString(),
      game: sportLabel(String(bet.sport || 'Sports')),
      prediction: `${market}: ${pickText}`,
      outcome,
      detail: [teams, league].filter(Boolean).join(' · '),
      amount: toNum(bet.stake),
      currency: String(bet.currency || 'INR'),
      odds: toNum(bet.odds) || null,
      payout: toNum(bet.payoutAmount),
      status,
    };
  }

  private mapGame(session: any, username: string): BetHistoryItem {
    const gameType = String(session.gameType || 'game');
    const result = session.result && typeof session.result === 'object' ? session.result : {};
    const amount = toNum(session.betAmount);
    const payout = toNum(session.winAmount);
    const described = describeGame(gameType, result);
    const status = gamePlayStatus(String(session.status || ''), result, payout, amount);

    return {
      id: session.id,
      source: 'game',
      userId: session.userId,
      username,
      playedAt: session.createdAt.toISOString(),
      game: GAME_LABELS[gameType] || titleCase(gameType.replace(/_/g, ' ')),
      prediction: described.prediction,
      outcome: described.outcome || statusLabel(status),
      detail: 'Casino',
      amount,
      currency: String(session.currency || 'INR'),
      odds: described.odds,
      payout,
      status,
    };
  }
}

const gameSelect = {
  id: true,
  userId: true,
  gameType: true,
  status: true,
  betAmount: true,
  currency: true,
  winAmount: true,
  result: true,
  createdAt: true,
  completedAt: true,
} as const;

function titleCase(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sportLabel(sport: string) {
  const head = sport.split('/')[0].replace(/[._-]/g, ' ');
  return titleCase(head || 'Sports');
}

function statusLabel(status: string) {
  if (status === 'pending') return 'In progress';
  if (status === 'won') return 'Won';
  if (status === 'lost') return 'Lost';
  if (status === 'push') return 'Push';
  if (status === 'cancelled') return 'Cancelled';
  return titleCase(status);
}

function gamePlayStatus(status: string, result: any, winAmount: number, betAmount: number) {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'pending' || status === 'active') return 'pending';
  const outcome = String(result?.outcome || '');
  const winner = String(result?.winner || '');
  if (outcome === 'push' || outcome === 'draw' || winner === 'tie') return 'push';
  if (result?.win === true) return 'won';
  if (result?.win === false) return 'lost';
  if (winAmount > betAmount + 0.0001) return 'won';
  if (winAmount > 0 && Math.abs(winAmount - betAmount) < 0.0001) return 'push';
  return 'lost';
}

function positiveNumber(...values: unknown[]) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function describeGame(gameType: string, result: any): { prediction: string; outcome: string; odds: number | null } {
  const odds = positiveNumber(result?.payoutMultiplier, result?.finalMultiplier, result?.multiplier, result?.cashOutAt, result?.targetMultiplier);
  let prediction = '';
  let outcome = '';

  switch (gameType) {
    case 'dice':
      prediction = result?.target != null ? `Target ${result.target}` : 'Dice roll';
      outcome = result?.rollValue != null ? `Roll ${result.rollValue}` : '';
      break;
    case 'crash':
      prediction = result?.cashOutAt != null ? `Cash out at ${result.cashOutAt}x` : 'Crash';
      outcome = result?.crashPoint != null ? `Crash point ${result.crashPoint}x` : '';
      break;
    case 'coinflip':
      prediction = result?.choice ? `Pick ${result.choice}` : 'Coin flip';
      outcome = result?.flip ? `Landed ${result.flip}` : '';
      break;
    case 'limbo':
      prediction = result?.targetMultiplier != null ? `Target ${result.targetMultiplier}x` : 'Limbo';
      outcome = result?.resultMultiplier != null ? `Result ${result.resultMultiplier}x` : '';
      break;
    case 'roulette':
      prediction = result?.betType === 'number' ? `Number ${result.number}` : result?.betType ? `Bet ${result.betType}` : 'Roulette';
      outcome = result?.spin != null ? `Landed ${result.spin}${result.color ? ` (${result.color})` : ''}` : '';
      break;
    case 'color_prediction':
      prediction = result?.color ? `Color ${result.color}` : 'Color';
      outcome = result?.outcome ? `Result ${result.outcome}${result.roll != null ? ` (${result.roll})` : ''}` : '';
      break;
    case 'dragon_tiger':
      prediction = result?.betOn ? `Bet ${result.betOn}` : 'Dragon Tiger';
      outcome = result?.outcome ? `Winner ${result.outcome}` : '';
      break;
    case 'andar_bahar':
      prediction = result?.betOn ? `Bet ${result.betOn}` : 'Andar Bahar';
      outcome = result?.winner ? `Winner ${result.winner}` : '';
      break;
    case 'baccarat':
      prediction = result?.betOn ? `Bet ${result.betOn}` : 'Baccarat';
      outcome = result?.outcome ? `Winner ${result.outcome}` : '';
      break;
    case 'blackjack':
      prediction = 'Blackjack hand';
      outcome = result?.outcome
        ? `${titleCase(String(result.outcome))}${result.playerValue != null ? ` · player ${result.playerValue}` : ''}`
        : '';
      break;
    case 'wheel':
      prediction = 'Spin the wheel';
      outcome = result?.segment?.label ? `Segment ${result.segment.label}` : '';
      break;
    case 'number_hilo':
      prediction = result?.guess ? `${titleCase(String(result.guess))} than ${result.start}` : 'Number Hi-Lo';
      outcome = result?.next != null ? `Next number ${result.next}` : '';
      break;
    case 'hilo':
      prediction = result?.streak != null ? `Streak ${result.streak}` : 'Hi-Lo';
      outcome = result?.outcome ? titleCase(String(result.outcome)) : result?.current ? `Card ${result.current}` : '';
      break;
    case 'mines':
      prediction = result?.minesCount != null ? `${result.minesCount} mines` : 'Mines';
      if (Array.isArray(result?.revealed)) prediction += `, ${result.revealed.length} opened`;
      outcome = result?.hitMine ? 'Hit a mine' : result?.win ? 'Cashed out' : '';
      break;
    case 'keno':
      prediction = Array.isArray(result?.picks) && result.picks.length ? `Numbers ${result.picks.join(', ')}` : 'Keno';
      outcome = result?.matches != null ? `${result.matches} matches` : '';
      break;
    case 'plinko':
      prediction = [result?.rows ? `${result.rows} rows` : '', result?.risk ? `${result.risk} risk` : ''].filter(Boolean).join(', ') || 'Plinko';
      outcome = result?.multiplier != null ? `${result.multiplier}x` : '';
      break;
    case 'tower':
      prediction = result?.level != null ? `Reached level ${result.level}` : 'Tower';
      outcome = result?.outcome ? titleCase(String(result.outcome)) : '';
      break;
    case 'scratch':
      prediction = 'Scratch card';
      outcome = Array.isArray(result?.revealed) ? result.revealed.join(' ') : '';
      break;
    case 'slots':
      prediction = 'Spin';
      outcome = Array.isArray(result?.wins) && result.wins.length
        ? result.wins.map((win: any) => win?.symbol || win?.line).filter(Boolean).join(', ')
        : '';
      break;
    case 'poker':
    case 'video_poker':
      prediction = result?.playerHand?.description || result?.playerHand?.rank || 'Poker hand';
      outcome = result?.winner ? `Winner ${result.winner}` : result?.handRank ? String(result.handRank) : '';
      break;
    case 'tic_tac_toe':
      prediction = result?.userSymbol ? `Play ${result.userSymbol}` : 'Tic Tac Toe';
      outcome = result?.outcome ? titleCase(String(result.outcome)) : '';
      break;
    default:
      prediction = GAME_LABELS[gameType] || titleCase(gameType.replace(/_/g, ' '));
      outcome = result?.outcome ? titleCase(String(result.outcome)) : '';
  }

  return {
    prediction: prediction || GAME_LABELS[gameType] || 'Bet',
    outcome,
    odds,
  };
}
