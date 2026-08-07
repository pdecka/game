import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bonus')
export class BonusController {
  constructor(private bonusService: BonusService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-bonuses')
  async getMyBonuses(@Request() req) {
    return this.bonusService.getUserBonuses(req.user.id);
  }
}
