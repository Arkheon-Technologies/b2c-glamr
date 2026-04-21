import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessAddressDto {
  @IsString()
  @MaxLength(200)
  line1!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsString()
  @MaxLength(2)
  countryCode!: string;

  @IsString()
  @MaxLength(60)
  timezone!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateBusinessDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  businessType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  about?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BusinessAddressDto)
  address!: BusinessAddressDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  verticalIds?: string[];
}
