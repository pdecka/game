import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayColorPredictionDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['red', 'green', 'violet'])
  color: 'red' | 'green' | 'violet';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

