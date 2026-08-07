import { IsArray, IsBoolean, IsString } from 'class-validator';

export class VideoPokerDrawDto {
  @IsString()
  sessionId: string;

  @IsArray()
  @IsBoolean({ each: true })
  hold: boolean[]; // length 5
}

