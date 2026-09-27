import { IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
