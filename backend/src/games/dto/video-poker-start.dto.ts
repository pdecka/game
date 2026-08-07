import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class VideoPokerStartDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

