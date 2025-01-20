import {
  IsNotEmpty,
  IsString,
  IsEmail,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateLogginDto {
  @IsNotEmpty({ message: 'Email is not emty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: 'Email must be without accents',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is not emty' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(25, { message: 'Password must not exceed 25 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}
