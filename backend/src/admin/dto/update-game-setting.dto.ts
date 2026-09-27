import { IsBoolean, IsEnum, IsNumber, IsOptional, Max, Min, IsObject } from 'class-validator';
import { Currency, GameType } from '@gaming-platform/shared';
import { Type } from 'class-transformer';

export class UpdateGameSettingDto {
  @IsEnum(GameType)
  gameType: GameType;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(1)
  rtp?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(0.5)
  houseEdge?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minBet?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBet?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWin?: number;

  @IsOptional()
  @IsBoolean()
  manualOverride?: boolean;

  @IsOptional()
  @IsBoolean()
  forceWin?: boolean | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  winChance?: number | null;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  metadata?: Record<string, any>;
}

