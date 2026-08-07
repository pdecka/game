import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminSignupDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';
import { UserRole } from '@gaming-platform/shared';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('signup')
  async signup(@Body() dto: AdminSignupDto) {
    const role = dto.role || UserRole.ADMIN;
    return this.adminAuthService.signup(dto.email, dto.username, dto.password, role, dto.signupCode);
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    console.log('[admin/auth/login] REQ BODY:', { email: dto?.email });
    return this.adminAuthService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}

