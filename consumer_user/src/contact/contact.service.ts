import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CheckCodeDto, CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class ContactService {
  private readonly adminEmail = 'nguyenkiet18072002@gmail.com'; // Email admin
  constructor(
    private readonly mailerService: MailerService,
    private prisma: PrismaService,
  ) {}

  sendAdmin(mailerDto: CreateContactDto) {
    try {
      this.mailerService.sendMail({
        to: this.adminEmail,
        subject: mailerDto.subject,
        template: './admin',
        context: {
          activationCode: '123456',
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

  async sendUser(mailerDto: CreateContactDto) {
    const account_code = await this.prisma.account.findUnique({
      where: { email: mailerDto.email },
    });
    const user = await this.prisma.user.findUnique({
      where: { email: mailerDto.email },
    });
    try {
      this.mailerService.sendMail({
        to: mailerDto.email,
        subject: 'Notification',
        template: './reply',
        context: {
          activationCode: account_code.codeId,
          name: mailerDto.name,
        },
      });
      return {
        id: user.id,
        code: account_code.codeId,
      };
    } catch (error) {
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async checkCode(data: CheckCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(data.id) },
    });
    const account = await this.prisma.account.findUnique({
      where: { email: user.email },
    });
    if (account.codeId !== data.code)
      throw new RpcException({
        message: 'The code does not exist or has expired.',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    await this.prisma.account.update({
      where: { email: account.email },
      data: { isActive: true },
    });
    return data;
  }
}
