import { IsInt, IsString, Max, Min } from 'class-validator';

export class TicTacToeMoveDto {
  @IsString()
  sessionId: string;

  @IsInt()
  @Min(0)
  @Max(8)
  position: number;
}
