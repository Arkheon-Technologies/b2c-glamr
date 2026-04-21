import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  businessId!: string;

  @IsString()
  @MaxLength(100)
  displayName!: string;

  @IsString()
  role!: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
