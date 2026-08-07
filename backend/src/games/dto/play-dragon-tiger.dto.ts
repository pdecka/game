import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayDragonTigerDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['dragon', 'tiger', 'tie'])
  betOn: 'dragon' | 'tiger' | 'tie';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

