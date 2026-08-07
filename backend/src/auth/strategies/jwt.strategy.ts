import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { UserStatus } from '@gaming-platform/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: any) {
    try {
      console.log('[jwt/validate] payload:', { sub: payload?.sub, role: payload?.role });
      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        console.log('[jwt/validate] rejected:', { userFound: Boolean(user), status: user?.status, expected: UserStatus.ACTIVE });
        return null;
      }
      const u = await this.usersService.ensureReferralCode(user.id);
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        username: u.username,
        referralCode: u.referralCode,
        status: u.status,
      };
    } catch (error) {
      console.log('[jwt/validate] ERROR:', error);
      return null;
    }
  }
}
