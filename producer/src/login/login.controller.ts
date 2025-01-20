import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { Public } from 'src/auth/auth.decorator';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post()
  @UsePipes(ValidationPipe)
  login(@Body() CreateLoginDto: CreateLoginDto) {
    return this.loginService.login(CreateLoginDto);
  }
}
