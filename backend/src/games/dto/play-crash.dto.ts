import { IsNumber, IsEnum, Min, IsOptional, IsString } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayCrashDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(1.01)
  cashOutAt: number;

  @IsOptional()
  @IsString()
  clientSeed?: string;
}
