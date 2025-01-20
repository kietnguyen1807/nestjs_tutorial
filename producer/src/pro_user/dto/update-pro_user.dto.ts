import { PartialType } from '@nestjs/mapped-types';
import { CreateProUserDto } from './create-pro_user.dto';

export class UpdateProUserDto extends PartialType(CreateProUserDto) {}
