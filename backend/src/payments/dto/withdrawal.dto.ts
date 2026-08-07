import { IsNumber, IsEnum, Min, IsOptional, IsObject, IsString } from 'class-validator';
import { PaymentMethod, Currency } from '@gaming-platform/shared';

export class WithdrawalDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  accountDetails?: Record<string, any>;

  // Optional reference/UTR for reconciliation.
  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
