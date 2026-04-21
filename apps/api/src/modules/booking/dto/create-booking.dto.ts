import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  service_id!: string;

  @IsOptional()
  @IsString()
  staff_id?: string;

  @IsDateString()
  start_at!: string;

  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  guest_name?: string;

  @IsOptional()
  @IsEmail()
  guest_email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  guest_phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  idempotency_key?: string;
}