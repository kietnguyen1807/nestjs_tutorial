import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FilesUploadService } from './files_upload.service';
import { CreateFilesUploadDto } from './dto/create-files_upload.dto';
import { UpdateFilesUploadDto } from './dto/update-files_upload.dto';

@Controller('files-upload')
export class FilesUploadController {
  constructor(private readonly filesUploadService: FilesUploadService) {}
  @Delete(':id')
  deleUserById(@Param('id', ParseIntPipe) id: number) {
    return this.filesUploadService.deleFileById(id);
  }
}
