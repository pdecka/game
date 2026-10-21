import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { SportsBetType } from '../sports.enums'

export class PlaceSportsBetDto {
  @IsString()
  @MinLength(1)
  sport: string

  @IsString()
  matchId: string

  @IsOptional()
  @IsEnum(SportsBetType)
  betType?: SportsBetType

  @IsString()
  selection: string

  @IsOptional()
  @IsNumber()
  line?: number

  @IsNumber()
  @Min(1)
  stake: number

  /** Bookmaker market key, for example h2h, spreads, totals, btts. */
  @IsOptional()
  @IsString()
  marketKey?: string

  /** Bookmaker key or title the price was taken from. */
  @IsOptional()
  @IsString()
  bookmaker?: string

  /** Price the customer saw. The server still stores its own snapshot. */
  @IsOptional()
  @IsNumber()
  odds?: number
}

