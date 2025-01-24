import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CheckCodeDto {
  @IsNotEmpty({ message: 'Id is not emty' })
  id: string;

  @IsNotEmpty({ message: 'Code is not emty' })
  code: string;
}
