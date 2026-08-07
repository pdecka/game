import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator'
import { SportType, SportsBetType } from '../sports.enums'

export class PlaceSportsBetDto {
  @IsEnum(SportType)
  sport: SportType

  @IsString()
  matchId: string

  @IsEnum(SportsBetType)
  betType: SportsBetType

  @IsString()
  selection: string

  @IsOptional()
  @IsNumber()
  line?: number

  @IsNumber()
  @Min(1)
  stake: number
}

