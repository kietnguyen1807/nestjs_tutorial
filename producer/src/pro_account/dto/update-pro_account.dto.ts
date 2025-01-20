import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-pro_account.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
