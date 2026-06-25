import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsPhoneNumber,
  ValidateIf,
  IsEnum,
  MaxLength,
} from 'class-validator';

export enum LoginMethod {
  EMAIL = 'email',
  PHONE = 'phone',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsNotEmpty({ message: 'First name is required' })
  @IsString()
  @Length(1, 100, { message: 'First name must be 1-100 characters' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @IsString()
  @Length(1, 100, { message: 'Last name must be 1-100 characters' })
  last_name: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 128, { message: 'Password must be 8-128 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain number' })
  @Matches(/[!@#$%^&*]/, {
    message: 'Password must contain special character (!@#$%^&*)',
  })
  password: string;

  @IsPhoneNumber('AU', { message: 'Invalid Australian phone number' })
  phone!: string;

  @IsEnum(['customer', 'business'], { message: 'Role must be customer or business' })
  role!: string;
}

export class LoginDto {
  @IsEnum(LoginMethod)
  method!: LoginMethod;

  @ValidateIf((o) => o.method === LoginMethod.EMAIL)
  @IsEmail({}, { message: 'Invalid email' })
  email?: string;

  @ValidateIf((o) => o.method === LoginMethod.PHONE)
  @IsPhoneNumber('AU', { message: 'Invalid phone' })
  phone?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(1, 128)
  password!: string;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 6)
  code!: string;

  @IsEmail()
  email?: string;

  @IsPhoneNumber('AU')
  phone?: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Length(32, 32, { message: 'Invalid reset token' })
  token!: string;

  @IsNotEmpty()
  @Length(8, 128)
  @Matches(/[A-Z]/)
  @Matches(/[a-z]/)
  @Matches(/[0-9]/)
  @Matches(/[!@#$%^&*]/)
  password!: string;
}
