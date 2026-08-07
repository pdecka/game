import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayPlinkoDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  @Min(8)
  @Max(16)
  rows: number;

  @IsEnum(['low', 'medium', 'high'])
  risk: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

