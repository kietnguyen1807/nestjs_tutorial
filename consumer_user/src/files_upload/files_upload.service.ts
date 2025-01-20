import { HttpException, Injectable } from '@nestjs/common';
import { CreateFilesUploadDto } from './dto/create-files_upload.dto';
import { UpdateFilesUploadDto } from './dto/update-files_upload.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilesUploadService {
  constructor(private prisma: PrismaService) {}
  async deleFileById(id: number) {
    const findfile = await this.prisma.files.findUnique({ where: { id } });
    if (!findfile) throw new HttpException('Files not found', 404);
    await this.prisma.files.delete({ where: { id } });
    return `Files with ID ${id} successfully deleted`;
  }
}
