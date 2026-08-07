import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class TicTacToeStartDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['X', 'O'])
  userSymbol: 'X' | 'O';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}
