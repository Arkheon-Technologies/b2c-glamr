import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreatePortfolioUploadIntentDto {
  @IsString()
  business_id!: string;

  @IsString()
  @MaxLength(255)
  file_name!: string;

  @IsString()
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
  content_type!: string;

  @IsString()
  @IsIn([
    'before',
    'after',
    'healed',
    'before_thumb',
    'after_thumb',
    'watermarked_after',
  ])
  variant!:
    | 'before'
    | 'after'
    | 'healed'
    | 'before_thumb'
    | 'after_thumb'
    | 'watermarked_after';
}
