import {
  Inject,
  Injectable,
  NotFoundException,
  StreamableFile,
  Res,
  HttpException,
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProUserDto } from './dto/create-pro_user.dto';
import { UpdateProUserDto } from './dto/update-pro_user.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { createAccountforUser } from './dto/create-accountforuser.dto';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express'; // Import từ express
@Injectable()
export class ProUserService {
  constructor(
    @Inject('USER_SERVICE') private rabbitClient: ClientProxy,
    private prisma: PrismaService,
  ) {}

  async createUser(createUser: CreateProUserDto) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'user', cmd: 'create-user' },
        createUser,
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  getUser() {
    return this.rabbitClient.send({ service: 'user', cmd: 'fetch' }, {});
  }

  async getUserById(id: number) {
    // Gửi yêu cầu tới Consumer qua RPC
    try {
      const response = await this.rabbitClient.send(
        { service: 'user', cmd: 'fetch-user-id' },
        { id },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async updateUser(id: number, data: Prisma.UserUpdateInput) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'user', cmd: 'update-user' },
        { id, data },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else if (error.response.status === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async deleteUser(id: number) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'user', cmd: 'delete-user' },
        { id },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async createAccountForUser(
    id: number,
    createAccountForUser: createAccountforUser,
  ) {
    try {
      const response = await this.rabbitClient.emit(
        { service: 'user', cmd: 'createAccount-user' },
        { id, data: createAccountForUser },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async uploadAva(id: number, avaPath, sizePath, type) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'user', cmd: 'upload-Ava' },
        { id, avaPath, sizePath, type },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async uploadFile(id: number, filePath, sizePath, type) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'user', cmd: 'upload-file' },
        { id, filePath, sizePath, type },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  async Download(filename: string, res: Response): Promise<StreamableFile> {
    const filePath = join(process.cwd(), 'uploads_file', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }
    const file = createReadStream(filePath);
    res.set({
      'Content-Type': 'application/rtf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(file);
  }
}
