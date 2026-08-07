import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SportsService } from './sports.service'
import { SportType, SportsMatchStatus } from './sports.enums'
import { PlaceSportsBetDto } from './dto/place-sports-bet.dto'

@Controller('sports')
export class SportsController {
  constructor(private sportsService: SportsService) {}

  @Get('odds/upcoming')
  async upcomingOdds() {
    return this.sportsService.getUpcomingOddsFeed()
  }

  @Get('matches')
  async listMatches(
    @Query('sport') sport: SportType,
    @Query('status') status?: SportsMatchStatus,
  ) {
    return this.sportsService.listMatches(sport, status)
  }

  @Get('matches/:matchId')
  async getMatch(@Param('matchId') matchId: string) {
    return this.sportsService.getMatch(matchId)
  }

  @Get('matches/:matchId/markets')
  async getMarkets(@Param('matchId') matchId: string) {
    return this.sportsService.getMarkets(matchId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('bets')
  async placeBet(@Request() req: any, @Body() dto: PlaceSportsBetDto) {
    return this.sportsService.placeBet(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('bets/my')
  async myBets(@Request() req: any) {
    return this.sportsService.listMyBets(req.user.id)
  }
}

