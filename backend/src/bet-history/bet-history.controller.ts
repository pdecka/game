import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { BetHistoryOrder, BetHistoryService, BetHistorySource } from './bet-history.service';

@Controller()
export class BetHistoryController {
  constructor(private readonly betHistoryService: BetHistoryService) {}

  @UseGuards(JwtAuthGuard)
  @Get('bet-history')
  async mine(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('source') source?: string,
    @Query('order') order?: string,
  ) {
    return this.betHistoryService.list({
      userId: req.user.id,
      page: pageNumber(page, 1, 100000),
      pageSize: pageNumber(pageSize, 25, 100),
      source: sourceFilter(source),
      order: orderFilter(order),
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/bet-history')
  async all(
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('source') source?: string,
    @Query('order') order?: string,
  ) {
    const id = typeof userId === 'string' && /^[0-9a-f-]{36}$/i.test(userId) ? userId : undefined;
    return this.betHistoryService.list({
      userId: id,
      page: pageNumber(page, 1, 100000),
      pageSize: pageNumber(pageSize, 25, 100),
      source: sourceFilter(source),
      order: orderFilter(order),
    });
  }
}

function pageNumber(value: string | undefined, fallback: number, max: number) {
  const n = parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(max, n);
}

function sourceFilter(value: string | undefined): BetHistorySource {
  if (value === 'sports' || value === 'game') return value;
  return 'all';
}

function orderFilter(value: string | undefined): BetHistoryOrder {
  return value === 'asc' ? 'asc' : 'desc';
}
