import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'Email is not emty' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, {
    message: 'Email must be without accents',
  })
  @MaxLength(50, { message: 'Email must not exceed 50 characters' })
  email: string;

  @IsNotEmpty({ message: 'Name is not emty' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsNotEmpty({ message: 'Subject is not emty' })
  @MaxLength(100, { message: 'Subject must not exceed 100 characters' })
  subject: string;

  @IsNotEmpty({ message: 'Message is not emty' })
  @MaxLength(1000, { message: 'Message must not exceed 1000 characters' })
  message: string;
}

export class CheckCodeDto {
  @IsNotEmpty({ message: 'Id is not emty' })
  id: number;

  @IsNotEmpty({ message: 'Code is not emty' })
  code: string;
}
