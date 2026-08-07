import { IsNumber, IsEnum, Min, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, Currency } from '@gaming-platform/shared';

export class DepositDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  // Optional reference (e.g., UTR) captured for admin reconciliation.
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @IsOptional()
  @IsString()
  txHash?: string;

  @IsOptional()
  @IsString()
  network?: string;
}
