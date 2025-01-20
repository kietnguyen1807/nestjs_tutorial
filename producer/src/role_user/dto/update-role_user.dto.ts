import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleUserDto } from './create-role_user.dto';

export class UpdateRoleUserDto extends PartialType(CreateRoleUserDto) {}
