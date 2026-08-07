import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayBaccaratDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['player', 'banker', 'tie'])
  betOn: 'player' | 'banker' | 'tie';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

