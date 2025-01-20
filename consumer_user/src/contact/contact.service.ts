import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class ContactService {
  private readonly adminEmail = 'nguyenkiet18072002@gmail.com'; // Email admin
  constructor(private readonly mailerService: MailerService) {}

  sendAdmin(mailerDto: CreateContactDto) {
    try {
      this.mailerService.sendMail({
        to: this.adminEmail,
        subject: mailerDto.subject,
        template: './admin',
        context: {
          name: mailerDto.name,
          email: mailerDto.email,
          subject: mailerDto.subject,
          message: mailerDto.message,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal Server error');
    }
  }
  sendUser(mailerDto: CreateContactDto) {
    try {
      this.mailerService.sendMail({
        to: mailerDto.email,
        subject: 'Notification',
        template: './reply',
        context: {
          name: mailerDto.name,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
