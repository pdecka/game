import { IsEnum, IsString } from 'class-validator';

export class HiLoActionDto {
  @IsString()
  sessionId: string;

  @IsEnum(['higher', 'lower', 'cashout'])
  action: 'higher' | 'lower' | 'cashout';
}

