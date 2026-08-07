import { Controller, Post, Get, UseGuards, Request, Body } from '@nestjs/common';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitKycDto } from './dto/submit-kyc.dto';

@Controller('kyc')
export class KycController {
  constructor(private kycService: KycService) {}

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  async submitKyc(@Request() req, @Body() submitKycDto: SubmitKycDto) {
    return this.kycService.submitKyc(req.user.id, submitKycDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async getKycStatus(@Request() req) {
    return this.kycService.getUserKyc(req.user.id);
  }
}
