import { IsString, MinLength, MaxLength } from 'class-validator';

export class AskQuestionDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  question: string;
}
