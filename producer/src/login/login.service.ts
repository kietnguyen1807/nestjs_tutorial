import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LoginService {
  constructor(
    @Inject('USER_SERVICE') private rabbitClient: ClientProxy,
    private prisma: PrismaService,
  ) {}

  async login(createLogin: CreateLoginDto) {
    try {
      const result = await this.rabbitClient.send(
        { cmd: 'login' },
        createLogin,
      );
      return result; // Kết quả trả về là token từ consumer
    } catch (error) {
      if (error.response.status === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
