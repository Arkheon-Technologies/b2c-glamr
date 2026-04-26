import { IsInt, IsOptional, IsString, Min, IsEmail } from 'class-validator';

export class PurchaseGiftCardDto {
  @IsInt()
  @Min(1000) // minimum 10 RON in bani
  amountCents: number;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsString()
  personalMessage?: string;

  @IsOptional()
  @IsString()
  scheduledFor?: string; // ISO date string

  @IsOptional()
  @IsString()
  businessId?: string;
}
