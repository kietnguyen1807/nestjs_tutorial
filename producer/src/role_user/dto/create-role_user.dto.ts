import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  Matches,
  IsDateString,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class CreateRoleUserDto {
  @IsNotEmpty({ message: 'RoleId is not emty' })
  @IsString()
  role: string;
}
