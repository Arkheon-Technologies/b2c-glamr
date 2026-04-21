import { IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  business_id!: string;

  @IsOptional()
  @IsString()
  location_id?: string;

  @IsString()
  @MaxLength(100)
  customer_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  service_id?: string;

  @IsOptional()
  @IsString()
  staff_preference?: string;
}