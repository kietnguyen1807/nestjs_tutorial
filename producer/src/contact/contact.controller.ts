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
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { RegisterDto } from './dto/reply-register.dto';
import { CheckCodeDto } from './dto/check-code.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async send_email(@Body() contactDto: CreateContactDto) {
    await this.contactService.sendMail(contactDto);
    return { message: 'Your message has been sent successfully.' };
  }

  @Post('register')
  async reply_register(@Body() registerDto: RegisterDto) {
    return await this.contactService.sendReply(registerDto);
  }

  @Post('check-code')
  async checkCode(@Body() checkDto: CheckCodeDto) {
    return await this.contactService.CheckCode(checkDto);
  }
}
