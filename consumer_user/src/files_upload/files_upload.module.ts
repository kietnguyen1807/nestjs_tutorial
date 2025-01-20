import { Module } from '@nestjs/common';
import { FilesUploadService } from './files_upload.service';
import { FilesUploadController } from './files_upload.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FilesUploadController],
  providers: [FilesUploadService],
})
export class FilesUploadModule {}
