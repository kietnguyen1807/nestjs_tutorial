import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { UpdateAccountDto } from './dto/update-pro_account.dto';
import { CreateAccountDto } from './dto/create-pro_account.dto';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProAccountService {
  constructor(
    @Inject('USER_SERVICE') private rabbitClient: ClientProxy,
    private prisma: PrismaService,
  ) {}

  async createAccount(CreateAccountDto: CreateAccountDto) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'account', cmd: 'create-account' },
        CreateAccountDto,
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
  getAccounts() {
    return this.rabbitClient.send(
      { service: 'account', cmd: 'fetch-account' },
      {},
    );
  }

  async getAccountById(id: number) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'account', cmd: 'fetch-account-id' },
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

  async deleteAccount(id: number) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'account', cmd: 'delete-account' },
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

  async updateAccount(id: number, data: Prisma.AccountUpdateInput) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'account', cmd: 'update-account' },
        { id, data },
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
}
