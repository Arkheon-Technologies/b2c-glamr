import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListPortfolioDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  business_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  technician_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vertical?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  include_unpublished?: boolean;
}
