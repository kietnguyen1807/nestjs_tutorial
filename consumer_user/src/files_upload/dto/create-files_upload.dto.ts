import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFilesUploadDto {
  @IsString()
  @IsOptional()
  avatar: string;
  @IsString()
  @IsOptional()
  file_upload: string;
  userId: number;
  @IsOptional()
  size_image: number;
  @IsOptional()
  type_image: string;
  @IsOptional()
  size_file: number;
  @IsOptional()
  type_file: string;
}
