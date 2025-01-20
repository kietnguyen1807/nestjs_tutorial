import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ClientProxy } from '@nestjs/microservices';

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
}
