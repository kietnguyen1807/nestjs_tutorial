import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email is not emty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: 'Email must be without accents',
  })
  @MaxLength(50, { message: 'Email must not exceed 50 characters' })
  email: string;
}
