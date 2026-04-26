import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class DiscoverBusinessesDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  query?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  vertical?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  /** Bounding box: "sw_lat,sw_lng,ne_lat,ne_lng" */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bbox?: string;
}