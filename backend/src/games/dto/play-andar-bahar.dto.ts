import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayAndarBaharDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(['andar', 'bahar'])
  betOn: 'andar' | 'bahar';

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

