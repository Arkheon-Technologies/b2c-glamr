import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListServicesDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  business_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vertical?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}