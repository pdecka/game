import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayNumberHiLoDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(0)
  @Max(9)
  start: number;

  @IsEnum(['higher', 'lower'])
  guess: 'higher' | 'lower';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

