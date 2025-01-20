import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}
  getRoles() {
    return this.prisma.roles.findMany({ include: { user: true } });
  }

  async getRoleById(id: number) {
    const findRole = await this.prisma.roles.findUnique({
      where: { id },
    });
    if (!findRole)
      throw new RpcException({
        message: 'Role not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    return this.prisma.roles.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async createRole(createRole: CreateRoleDto) {
    const { role, ...data } = createRole;
    const findRole = await this.prisma.roles.findUnique({
      where: { role: role },
    });
    if (findRole)
      throw new RpcException({
        message: 'Role already exists',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    return this.prisma.roles.create({
      data: {
        role: createRole.role,
      },
    });
  }
  updateRole(id: number, data: Prisma.RolesUpdateInput) {
    return this.prisma.roles.update({ where: { id }, data });
  }
}
