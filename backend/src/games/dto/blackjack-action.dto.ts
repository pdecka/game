import { IsEnum, IsString } from 'class-validator';

export class BlackjackActionDto {
  @IsString()
  sessionId: string;

  @IsEnum(['hit', 'stand'])
  action: 'hit' | 'stand';
}

