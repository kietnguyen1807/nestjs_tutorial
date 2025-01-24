import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterDto } from './dto/reply-register.dto';
import { CheckCodeDto } from './dto/check-code.dto';

@Injectable()
export class ContactService {
  constructor(@Inject('USER_SERVICE') private rabbitClient: ClientProxy) {}

  async sendMail(contactDto: CreateContactDto) {
    try {
      const response = await this.rabbitClient.emit(
        { service: 'mail', cmd: 'send-mail' },
        contactDto,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendReply(registerDto: RegisterDto) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'mail', cmd: 'send-reply' },
        registerDto,
      );
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async CheckCode(checkDto: CheckCodeDto) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'mail', cmd: 'check-code' },
        checkDto,
      );
      return response;
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error);
      throw new InternalServerErrorException(error);
    }
  }
}
