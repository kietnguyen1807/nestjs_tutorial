import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RoleUserService } from './role_user.service';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';

@Controller('role-user')
export class RoleUserController {
  constructor(private readonly roleUserService: RoleUserService) {}

  @Get()
  getRole() {
    return this.roleUserService.getRole();
  }

  @Get(':id')
  getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.roleUserService.getRoleById(id);
  }

  @Post()
  createRole(@Body() CreateRoleUserDto: CreateRoleUserDto) {
    console.log(CreateRoleUserDto.role);
    return this.roleUserService.createRole(CreateRoleUserDto);
  }
}
