import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AvailabilityQueryDto {
  @IsString()
  service_id!: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  staff_id?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(60)
  slot_interval_min?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}