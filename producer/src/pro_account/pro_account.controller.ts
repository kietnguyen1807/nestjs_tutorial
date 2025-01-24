import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProAccountService } from './pro_account.service';
import { CheckEmailDto, CreateAccountDto } from './dto/create-pro_account.dto';
import { UpdateAccountDto } from './dto/update-pro_account.dto';

@Controller('pro-account')
export class ProAccountController {
  constructor(private readonly proAccountService: ProAccountService) {}

  @Post()
  createAccount(@Body() CreateAccountDto: CreateAccountDto) {
    return this.proAccountService.createAccount(CreateAccountDto);
  }

  @Get()
  getAccounts() {
    return this.proAccountService.getAccounts();
  }

  @Get(':id')
  getAccountById(@Param('id', ParseIntPipe) id: number) {
    return this.proAccountService.getAccountById(id);
  }

  @Delete(':id')
  DeleteAccount(@Param('id', ParseIntPipe) id: number) {
    return this.proAccountService.deleteAccount(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateAccountDto: UpdateAccountDto,
  ) {
    return this.proAccountService.updateAccount(id, UpdateAccountDto);
  }

  @Post('checkemail')
  checkemail(@Body() data: CheckEmailDto) {
    return this.proAccountService.checkemail(data);
  }
}
