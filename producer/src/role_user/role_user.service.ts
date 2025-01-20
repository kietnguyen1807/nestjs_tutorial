import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleUserDto } from './dto/create-role_user.dto';
import { UpdateRoleUserDto } from './dto/update-role_user.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RoleUserService {
  constructor(@Inject('USER_SERVICE') private rabbitClient: ClientProxy) {}

  getRole() {
    return this.rabbitClient.send({ service: 'role', cmd: 'fetch-role' }, {});
  }

  async getRoleById(id: number) {
    try {
      const response = await this.rabbitClient.send(
        { service: 'role', cmd: 'fetch-role-id' },
        { id },
      );
      return response;
    } catch (error) {
      if (error.response.status === HttpStatus.NOT_FOUND)
        throw new NotFoundException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }

  createRole(CreateRoleUserDto: CreateRoleUserDto) {
    try {
      return this.rabbitClient.send(
        { service: 'role', cmd: 'create-role' },
        CreateRoleUserDto,
      );
    } catch (error) {
      if (error.response.status === HttpStatus.BAD_REQUEST)
        throw new BadRequestException(error);
      else {
        throw new InternalServerErrorException(error);
      }
    }
  }
}
