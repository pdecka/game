import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayCoinflipDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['heads', 'tails'])
  choice: 'heads' | 'tails';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

