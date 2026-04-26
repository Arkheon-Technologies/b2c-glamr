import { IsString, MinLength, MaxLength } from 'class-validator';

export class PostAnswerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(2000)
  answer: string;
}
