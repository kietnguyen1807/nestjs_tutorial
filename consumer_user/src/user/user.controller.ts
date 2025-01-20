import {
  Controller,
  Body,
  UsePipes,
  ValidationPipe,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { createAccountforUser } from './dto/create-accountforuser.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { CreateLoginDto } from './dto/create-login.dto';
import { ExceptionFilter } from 'src/rpcException/rpc-exception.filter';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'login' })
  handleLogin(@Payload() createLogin: CreateLoginDto) {
    return this.userService.Login(createLogin);
  }

  @MessagePattern({ service: 'user', cmd: 'create-user' })
  createUser(@Payload() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @MessagePattern({ service: 'user', cmd: 'fetch' })
  findAll() {
    return this.userService.getUsers();
  }

  @MessagePattern({ service: 'user', cmd: 'fetch-user-id' })
  getUserById(@Payload() data: { id: number }) {
    const user = this.userService.getUserById(data.id);
    return user;
  }

  @MessagePattern({ service: 'user', cmd: 'update-user' })
  @UsePipes(ValidationPipe)
  updateUserById(
    @Payload() payload: { id: number; data: Prisma.UserUpdateInput },
  ) {
    const { id, data } = payload;
    return this.userService.updateUserById(id, data);
  }

  @MessagePattern({ service: 'user', cmd: 'delete-user' })
  deleUserById(@Payload() data: { id: number }) {
    return this.userService.deleUserById(data.id);
  }

  @EventPattern({ service: 'user', cmd: 'createAccount-user' })
  @UsePipes(ValidationPipe)
  createAccountForUser(
    @Payload() payload: { id: number; data: createAccountforUser },
  ) {
    const { id, data } = payload;
    return this.userService.createAccountforUser(id, data);
  }

  @MessagePattern({ service: 'user', cmd: 'upload-Ava' })
  async uploadAva(
    @Payload()
    data: {
      id: number;
      avaPath: string;
      sizePath: string;
      typePath: string;
    },
  ) {
    return this.userService.uploadava(
      data.id,
      data.avaPath,
      data.sizePath,
      data.typePath,
    );
  }

  @MessagePattern({ service: 'user', cmd: 'upload-file' })
  uploadFile(
    @Payload()
    data: {
      id: number;
      filePath: string;
      sizePath: string;
      type: string;
    },
  ) {
    return this.userService.uploadfile(
      data.id,
      data.filePath,
      data.sizePath,
      data.type,
    );
  }
}
