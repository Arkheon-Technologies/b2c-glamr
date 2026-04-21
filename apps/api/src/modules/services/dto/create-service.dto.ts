import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  businessId!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsNumber()
  @IsPositive()
  durationActiveMin!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationProcessingMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationFinishMin?: number;

  @IsNumber()
  @Min(0)
  priceCents!: number;

  @IsString()
  @MaxLength(3)
  currency!: string;

  @IsOptional()
  @IsString()
  verticalId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];
}
