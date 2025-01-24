import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  ParseIntPipe,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseInterceptors,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ProUserService } from './pro_user.service';
import { CreateProUserDto } from './dto/create-pro_user.dto';
import { UpdateProUserDto } from './dto/update-pro_user.dto';
import { Public, ResponseMessage } from 'src/auth/auth.decorator';
import { EventPattern } from '@nestjs/microservices';
import { createAccountforUser } from './dto/create-accountforuser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { isValidFilename, storage_file, storage_image } from './storage.config';
import { unlinkSync } from 'fs';
import { extname } from 'path';
import type { Response } from 'express';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('pro-user')
export class ProUserController {
  constructor(private readonly proUserService: ProUserService) {}

  @Post()
  @ResponseMessage('Fetch register')
  createUser(@Body() createUser: CreateProUserDto) {
    return this.proUserService.createUser(createUser);
  }

  @Get()
  async getUser() {
    return await this.proUserService.getUser();
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.proUserService.getUserById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateProUserDto: UpdateProUserDto,
  ) {
    return this.proUserService.updateUser(id, UpdateProUserDto);
  }

  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.proUserService.deleteUser(id);
  }

  @Post('account/:id')
  createAccount(
    @Body() createAccount: createAccountforUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.proUserService.createAccountForUser(id, createAccount);
  }

  @Post('ava/:id')
  @UseInterceptors(FileInterceptor('ava', { storage: storage_image }))
  uploadAva(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 5 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No ava uploaded.');
    }
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
    const extensionRegex = new RegExp(
      `\\.(${validExtensions.join('|')})$`,
      'i',
    );
    if (!extensionRegex.test(file.originalname)) {
      unlinkSync(file.path);
      throw new BadRequestException('Invalid format file.');
    }
    if (!isValidFilename(file.originalname)) {
      unlinkSync(file.path);
      throw new BadRequestException('Invalid file name.');
    }

    const fileExtension = extname(file.originalname).slice(1); // Lấy phần mở rộng, bỏ đi dấu '.'
    return this.proUserService.uploadAva(
      id,
      file.path,
      file.size,
      fileExtension,
    );
  }

  @Post('file/:id')
  @UseInterceptors(FileInterceptor('file', { storage: storage_file }))
  uploadFile(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1000 * 1000 * 5 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    const validExtensions = ['pdf', 'docx', 'xlsx', 'rtf', 'bin', 'mp4', 'txt'];
    const extensionRegex = new RegExp(
      `\\.(${validExtensions.join('|')})$`,
      'i',
    );
    if (!extensionRegex.test(file.originalname)) {
      unlinkSync(file.path);
      throw new BadRequestException('Invalid format file.');
    }
    if (!isValidFilename(file.originalname)) {
      unlinkSync(file.path);
      throw new BadRequestException('Invalid file name.');
    }

    const fileExtension = extname(file.originalname).slice(1); // Lấy phần mở rộng, bỏ đi dấu '.'

    return this.proUserService.uploadFile(
      id,
      file.path,
      file.size,
      fileExtension,
    );
  }

  @Get('download/:filename')
  async getFileName(
    @Param('filename') filename: string, // Không sử dụng ParseIntPipe
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.proUserService.Download(filename, res);
  }
}
