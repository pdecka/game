import { Controller, Get, UseGuards } from '@nestjs/common';
import { FraudService } from './fraud.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('fraud')
@UseGuards(JwtAuthGuard, AdminGuard)
export class FraudController {
  constructor(private fraudService: FraudService) {}

  @Get('alerts')
  async getAlerts() {
    // Return fraud alerts
    return { alerts: [] };
  }
}
