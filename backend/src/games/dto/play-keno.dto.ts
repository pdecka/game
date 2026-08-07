import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayKenoDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsArray()
  @IsNumber({}, { each: true })
  picks: number[]; // 1..40

  @IsOptional()
  @IsString()
  clientSeed?: string;
}

