import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SetScheduleDto {
  @IsString()
  staffId!: string;

  @IsString()
  businessId!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @IsString()
  openTime!: string; // HH:MM e.g. "09:00"

  @IsString()
  closeTime!: string; // HH:MM e.g. "18:00"

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
