import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @MessagePattern({ service: 'role', cmd: 'fetch-role' })
  findAll() {
    return this.roleService.getRoles();
  }

  @MessagePattern({ service: 'role', cmd: 'fetch-role-id' })
  async getUserById(@Payload() data: { id: number }) {
    return await this.roleService.getRoleById(data.id);
  }

  @MessagePattern({ service: 'role', cmd: 'create-role' })
  createRole(@Payload() CreateRoleDto: CreateRoleDto) {
    return this.roleService.createRole(CreateRoleDto);
  }
}
