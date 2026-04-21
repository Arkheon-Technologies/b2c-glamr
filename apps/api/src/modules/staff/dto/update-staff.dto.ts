import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStaffDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
