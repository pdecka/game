import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayLimboDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(1.01)
  targetMultiplier: number;

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

