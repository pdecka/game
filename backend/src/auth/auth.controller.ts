import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, VerifyOtpDto, Verify2FADto, Enable2FADto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log('[auth/register] REQ BODY:', {
      email: registerDto?.email,
      username: registerDto?.username,
      phone: registerDto?.phone,
      countryCode: (registerDto as any)?.countryCode,
      referralCode: (registerDto as any)?.referralCode,
    });
    try {
      const res = await this.authService.register(
        registerDto.email,
        registerDto.username,
        registerDto.password,
        registerDto.phone,
        (registerDto as any)?.countryCode,
        (registerDto as any)?.referralCode,
      );
      console.log('[auth/register] OK:', { userId: res?.id, status: res?.status, role: res?.role });
      return res;
    } catch (error) {
      console.log('[auth/register] ERROR:', error);
      throw error;
    }
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('[auth/login] REQ USER:', {
      id: req?.user?.id,
      email: req?.user?.email,
      status: req?.user?.status,
      role: req?.user?.role,
    });
    try {
      const res = await this.authService.login(req.user);
      console.log('[auth/login] OK:', { token: Boolean(res?.access_token), userId: res?.user?.id });
      return res;
    } catch (error) {
      console.log('[auth/login] ERROR:', error);
      throw error;
    }
  }

  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    console.log('[auth/verify-otp] REQ BODY:', { email: verifyOtpDto?.email, otpProvided: Boolean(verifyOtpDto?.otp) });
    try {
      const res = await this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
      console.log('[auth/verify-otp] OK:', res);
      return res;
    } catch (error) {
      console.log('[auth/verify-otp] ERROR:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('enable-2fa')
  async enable2FA(@Request() req, @Body() enable2FADto: Enable2FADto) {
    return this.authService.enable2FA(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-2fa')
  async confirm2FA(@Request() req, @Body() verify2FADto: Verify2FADto) {
    return this.authService.confirm2FA(req.user.id, verify2FADto.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-2fa')
  async verify2FA(@Request() req, @Body() verify2FADto: Verify2FADto) {
    return this.authService.verify2FA(req.user.id, verify2FADto.token);
  }
}
