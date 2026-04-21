import { IsBoolean } from 'class-validator';

export class PublishPortfolioItemDto {
  @IsBoolean()
  is_published!: boolean;
}
