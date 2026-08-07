import { IsNumber, IsEnum, Min, IsArray, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Currency } from '@gaming-platform/shared';

export class PlayMinesDto {
  @IsNumber()
  @Min(0.01)
  betAmount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber()
  gridSize: number;

  @IsNumber()
  mines: number;

  @IsArray()
  @IsNumber({}, { each: true })
  positions: number[];

  @IsOptional()
  @IsString()
  clientSeed?: string;
}
