import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListQueueDto {
  @IsString()
  business_id!: string;

  @IsOptional()
  @IsString()
  location_id?: string;

  @IsOptional()
  @IsIn(['waiting', 'notified', 'serving', 'served', 'cancelled', 'no_show'])
  status?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}