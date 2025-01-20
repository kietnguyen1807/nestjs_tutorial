import { PartialType } from '@nestjs/swagger';
import { CreateFilesUploadDto } from './create-files_upload.dto';

export class UpdateFilesUploadDto extends PartialType(CreateFilesUploadDto) {}
