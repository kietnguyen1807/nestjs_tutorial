import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CheckEmailDto, CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @MessagePattern({ service: 'account', cmd: 'create-account' })
  createAccount(@Payload() CreateAccountDto: CreateAccountDto) {
    return this.accountService.createAccount(CreateAccountDto);
  }

  @MessagePattern({ service: 'account', cmd: 'check-email' })
  checkemail(@Payload() data: CheckEmailDto) {
    return this.accountService.checkemail(data);
  }

  @MessagePattern({ service: 'account', cmd: 'fetch-account' })
  getAccounts() {
    return this.accountService.getAccounts();
  }

  @MessagePattern({ service: 'account', cmd: 'fetch-account-id' })
  getAccountById(@Payload() data: { id: number }) {
    return this.accountService.getAccountById(data.id);
  }
  @MessagePattern({ service: 'account', cmd: 'update-account' })
  @UsePipes(ValidationPipe)
  updateAccountById(
    @Payload() payload: { id: number; data: Prisma.UserUpdateInput },
  ) {
    const { id, data } = payload;
    return this.accountService.updateAccountById(id, data);
  }
  @MessagePattern({ service: 'account', cmd: 'delete-account' })
  deleAccountById(@Payload() data: { id: number }) {
    return this.accountService.deleAccountById(data.id);
  }
}
