import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckEmailDto, CreateAccountDto } from './dto/create-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'; // Import bcryptjs để hash mật khẩu
import { Prisma } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // Tạo salt với độ khó 10
    return await bcrypt.hash(password, salt); // Trả về mật khẩu đã mã hóa
  }
  generateActivationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createAccount(createAccountDto: CreateAccountDto) {
    const activationCode = this.generateActivationCode();
    const { email, password, firstName, lastName, avatar, location, birthday } =
      createAccountDto;
    const existingAccount = await this.prisma.account.findUnique({
      where: { email },
    });
    if (existingAccount) {
      throw new RpcException({
        message: 'Email already exists',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    // Băm mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email, // Lưu email vào User
        firstName, // Lưu firstName vào User
        lastName, // Lưu lastName vào User
        avatar, // Lưu avatar vào User (nếu có)
        location, // Lưu location vào User (nếu có)
        birthday, // Lưu birthday vào User (nếu có)
      },
    });
    const account = await this.prisma.account.create({
      data: {
        email, // Thêm email vào dữ liệu
        password: hashedPassword, // Lưu mật khẩu đã mã hóa
        codeId: activationCode,
      },
      select: {
        id: true, // Chọn các trường muốn trả về
        email: true,
        createdDate: true,
        updatedDate: true,
        isActive: true,
        user: true,
      },
    });

    return account;
  }

  getAccounts() {
    return this.prisma.account.findMany({
      select: {
        id: true,
        email: true,
        createdDate: true,
        updatedDate: true,
        isActive: true,
        user: true, // Bao gồm thông tin từ bảng `User`
      },
    });
  }

  async getAccountById(id: number) {
    const findAccount = await this.prisma.account.findUnique({ where: { id } });
    if (!findAccount)
      throw new RpcException({
        message: 'Account not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    return this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdDate: true,
        updatedDate: true,
        isActive: true,
        user: true, // Bao gồm thông tin từ bảng `User`
      },
    });
  }

  async updateAccountById(id: number, data: Prisma.AccountUpdateInput) {
    const findAccount = await this.prisma.account.findUnique({ where: { id } });
    if (!findAccount)
      throw new RpcException({
        message: 'Account not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      return await this.prisma.account.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
        select: {
          id: true, // Chọn các trường muốn trả về
          email: true,
          createdDate: true,
          updatedDate: true,
          user: true,
        },
      });
    }
    const user = await this.prisma.user.update({
      where: {
        email: findAccount.email,
      },
      data,
      include: {
        Account: {
          select: {
            id: true,
            createdDate: true,
            updatedDate: true,
            email: true,
          },
        },
      },
    });
    return user;
  }

  async deleAccountById(id: number) {
    const findAccount = await this.getAccountById(id);
    if (!findAccount)
      throw new RpcException({
        message: 'Account not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    await this.prisma.account.delete({ where: { id } });
    return `Account with ID ${id} successfully deleted`;
  }

  async checkemail(data: CheckEmailDto) {
    const account = await this.prisma.account.findUnique({
      where: { email: data.email },
    });

    if (!account) {
      throw new RpcException({
        message: 'Invalid email',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      id: account.id,
    };
  }
}
