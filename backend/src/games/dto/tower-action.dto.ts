import { IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class TowerActionDto {
  @IsString()
  sessionId: string;

  @IsEnum(['pick', 'cashout'])
  action: 'pick' | 'cashout';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  column?: number; // 0..2
}

