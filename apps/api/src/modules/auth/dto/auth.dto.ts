import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  new_password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(8)
  refresh_token!: string;
}

export class LogoutDto {
  @IsString()
  @MinLength(8)
  refresh_token!: string;
}