import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export type RouletteBetType = 'red' | 'black' | 'odd' | 'even' | 'number';

export class PlayRouletteDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['red', 'black', 'odd', 'even', 'number'])
  betType: RouletteBetType;

  @IsOptional()
  @IsNumber()
  number?: number;

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

