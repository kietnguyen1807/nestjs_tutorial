import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @EventPattern({ service: 'mail', cmd: 'send-mail' })
  async sendAdmin(@Payload() mailerDto) {
    this.contactService.sendAdmin(mailerDto);
    return 'Send for admin successful';
  }

  @MessagePattern({ service: 'mail', cmd: 'send-reply' })
  async sendUser(@Payload() mailerDto) {
    return this.contactService.sendUser(mailerDto);
  }

  @MessagePattern({ service: 'mail', cmd: 'check-code' })
  async checkCode(@Payload() mailerDto) {
    return this.contactService.checkCode(mailerDto);
  }
}
