import { Controller, Post, Get, Body, UseGuards, Request, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PlayDiceDto,
  PlayCrashDto,
  PlayMinesDto,
  PlayPlinkoDto,
  PlayCoinflipDto,
  PlayLimboDto,
  PlayWheelDto,
  PlayRouletteDto,
  PlaySlotsDto,
  PlayBaccaratDto,
  BlackjackStartDto,
  BlackjackActionDto,
  HiLoStartDto,
  HiLoActionDto,
  TowerStartDto,
  TowerActionDto,
  PlayKenoDto,
  PlayScratchDto,
  PlayDragonTigerDto,
  PlayAndarBaharDto,
  VideoPokerStartDto,
  VideoPokerDrawDto,
  PlayColorPredictionDto,
  PlayNumberHiLoDto,
  PlayPokerDto,
  TicTacToeStartDto,
  TicTacToeMoveDto,
} from './dto';
import { Currency } from '@gaming-platform/shared';

@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('dice')
  async playDice(@Request() req, @Body() playDiceDto: PlayDiceDto) {
    return this.gamesService.playDice(
      req.user.id,
      playDiceDto.betAmount,
      playDiceDto.currency,
      playDiceDto.multiplier,
      playDiceDto.target,
      playDiceDto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('crash')
  async playCrash(@Request() req, @Body() playCrashDto: PlayCrashDto) {
    return this.gamesService.playCrash(
      req.user.id,
      playCrashDto.betAmount,
      playCrashDto.currency,
      playCrashDto.cashOutAt,
      playCrashDto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('mines/start')
  async startMines(@Request() req, @Body() playMinesDto: PlayMinesDto) {
    return this.gamesService.startMines(
      req.user.id,
      playMinesDto.betAmount,
      playMinesDto.currency,
      playMinesDto.gridSize,
      playMinesDto.mines,
      playMinesDto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('mines/reveal')
  async revealMines(@Request() req, @Body() revealDto: { sessionId: string; position: number }) {
    return this.gamesService.revealMines(req.user.id, revealDto.sessionId, revealDto.position);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mines/cashout')
  async cashoutMines(@Request() req, @Body() cashoutDto: { sessionId: string }) {
    return this.gamesService.cashoutMines(req.user.id, cashoutDto.sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mines')
  async playMines(@Request() req, @Body() playMinesDto: PlayMinesDto) {
    return this.gamesService.playMines(
      req.user.id,
      playMinesDto.betAmount,
      playMinesDto.currency,
      playMinesDto.gridSize,
      playMinesDto.mines,
      playMinesDto.positions,
      playMinesDto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('plinko')
  async playPlinko(@Request() req, @Body() playPlinkoDto: PlayPlinkoDto) {
    return this.gamesService.playPlinko(
      req.user.id,
      playPlinkoDto.betAmount,
      playPlinkoDto.currency,
      playPlinkoDto.rows,
      playPlinkoDto.risk,
      playPlinkoDto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('coinflip')
  async playCoinflip(@Request() req, @Body() dto: PlayCoinflipDto) {
    return this.gamesService.playCoinflip(
      req.user.id,
      dto.betAmount,
      dto.currency,
      dto.choice,
      dto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('limbo')
  async playLimbo(@Request() req, @Body() dto: PlayLimboDto) {
    return this.gamesService.playLimbo(
      req.user.id,
      dto.betAmount,
      dto.currency,
      dto.targetMultiplier,
      dto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('wheel')
  async playWheel(@Request() req, @Body() dto: PlayWheelDto) {
    return this.gamesService.playWheel(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('roulette')
  async playRoulette(@Request() req, @Body() dto: PlayRouletteDto) {
    return this.gamesService.playRoulette(
      req.user.id,
      dto.betAmount,
      dto.currency,
      dto.betType,
      dto.number,
      dto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('slots')
  async playSlots(@Request() req, @Body() dto: PlaySlotsDto) {
    return this.gamesService.playSlots(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('baccarat')
  async playBaccarat(@Request() req, @Body() dto: PlayBaccaratDto) {
    return this.gamesService.playBaccarat(req.user.id, dto.betAmount, dto.currency, dto.betOn, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('blackjack/start')
  async blackjackStart(@Request() req, @Body() dto: BlackjackStartDto) {
    return this.gamesService.blackjackStart(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('blackjack/action')
  async blackjackAction(@Request() req, @Body() dto: BlackjackActionDto) {
    return this.gamesService.blackjackAction(req.user.id, dto.sessionId, dto.action);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hilo/start')
  async hiloStart(@Request() req, @Body() dto: HiLoStartDto) {
    return this.gamesService.hiloStart(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hilo/action')
  async hiloAction(@Request() req, @Body() dto: HiLoActionDto) {
    return this.gamesService.hiloAction(req.user.id, dto.sessionId, dto.action);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tower/start')
  async towerStart(@Request() req, @Body() dto: TowerStartDto) {
    return this.gamesService.towerStart(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tower/action')
  async towerAction(@Request() req, @Body() dto: TowerActionDto) {
    return this.gamesService.towerAction(req.user.id, dto.sessionId, dto.action, dto.column);
  }

  @UseGuards(JwtAuthGuard)
  @Post('keno')
  async playKeno(@Request() req, @Body() dto: PlayKenoDto) {
    return this.gamesService.playKeno(req.user.id, dto.betAmount, dto.currency, dto.picks, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('scratch')
  async playScratch(@Request() req, @Body() dto: PlayScratchDto) {
    return this.gamesService.playScratch(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('dragon-tiger')
  async playDragonTiger(@Request() req, @Body() dto: PlayDragonTigerDto) {
    return this.gamesService.playDragonTiger(req.user.id, dto.betAmount, dto.currency, dto.betOn, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('andar-bahar')
  async playAndarBahar(@Request() req, @Body() dto: PlayAndarBaharDto) {
    return this.gamesService.playAndarBahar(req.user.id, dto.betAmount, dto.currency, dto.betOn, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video-poker/start')
  async videoPokerStart(@Request() req, @Body() dto: VideoPokerStartDto) {
    return this.gamesService.videoPokerStart(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('video-poker/draw')
  async videoPokerDraw(@Request() req, @Body() dto: VideoPokerDrawDto) {
    return this.gamesService.videoPokerDraw(req.user.id, dto.sessionId, dto.hold);
  }

  @UseGuards(JwtAuthGuard)
  @Post('color-prediction')
  async playColorPrediction(@Request() req, @Body() dto: PlayColorPredictionDto) {
    return this.gamesService.playColorPrediction(req.user.id, dto.betAmount, dto.currency, dto.color, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('poker')
  async playPoker(@Request() req, @Body() dto: PlayPokerDto) {
    return this.gamesService.playPoker(req.user.id, dto.betAmount, dto.currency, dto.clientSeed);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tic-tac-toe/start')
  async ticTacToeStart(@Request() req, @Body() dto: TicTacToeStartDto) {
    return this.gamesService.ticTacToeStart(
      req.user.id,
      dto.betAmount,
      dto.currency,
      dto.userSymbol,
      dto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('tic-tac-toe/move')
  async ticTacToeMove(@Request() req, @Body() dto: TicTacToeMoveDto) {
    return this.gamesService.ticTacToeMove(req.user.id, dto.sessionId, dto.position);
  }

  @UseGuards(JwtAuthGuard)
  @Post('number-hilo')
  async playNumberHiLo(@Request() req, @Body() dto: PlayNumberHiLoDto) {
    return this.gamesService.playNumberHiLo(
      req.user.id,
      dto.betAmount,
      dto.currency,
      dto.start,
      dto.guess,
      dto.clientSeed,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('live/crash')
  getLiveCrash() {
    return this.gamesService.getLiveCrashState();
  }

  @UseGuards(JwtAuthGuard)
  @Get('live/roulette')
  getLiveRoulette() {
    return this.gamesService.getLiveRouletteState();
  }

  @UseGuards(JwtAuthGuard)
  @Get('live/color-prediction')
  getLiveColorPrediction() {
    return this.gamesService.getLiveColorPredictionState();
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getHistory(@Request() req, @Query('limit') limit?: number) {
    return this.gamesService.getSessionHistory(req.user.id, limit ? parseInt(limit.toString()) : 50);
  }
}
