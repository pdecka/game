import { IsString, MinLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(10)
  phone: string;

  @IsString()
  @MinLength(2)
  countryCode: string;

  /** Optional affiliate / referral code (normalized server-side). */
  @IsOptional()
  @IsString()
  referralCode?: string;
}
