import { IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class DebitWalletDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsString()
  reason: string;
}
