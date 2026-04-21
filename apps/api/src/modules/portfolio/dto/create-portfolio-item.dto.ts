import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreatePortfolioItemDto {
  @IsString()
  business_id!: string;

  @IsString()
  technician_id!: string;

  @IsOptional()
  @IsString()
  appointment_id?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  before_url?: string;

  @IsUrl({ require_protocol: true })
  after_url!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  healed_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  before_thumb_url?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  after_thumb_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  service_vertical?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  service_name?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(30)
  consent_type?: string;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsBoolean()
  is_watermarked?: boolean;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  watermarked_after_url?: string;
}
