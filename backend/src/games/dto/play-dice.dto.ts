import { IsNumber, IsEnum, Min, IsOptional, IsString } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayDiceDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(1.01)
  multiplier: number;

  @IsEnum(['high', 'low'])
  target: 'high' | 'low';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}
