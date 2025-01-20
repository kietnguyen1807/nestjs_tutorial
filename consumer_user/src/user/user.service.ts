import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs'; // Import bcryptjs để hash mật khẩu
import { createAccountforUser } from './dto/create-accountforuser.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateLoginDto } from './dto/create-login.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // Tạo salt với độ khó 10
    return await bcrypt.hash(password, salt); // Trả về mật khẩu đã mã hóa
  }

  async Login(createLoggin: CreateLoginDto) {
    const { email, password } = createLoggin;
    const existingAccount = await this.prisma.account.findUnique({
      where: { email },
    });
    if (!existingAccount) {
      throw new RpcException({
        message: 'Email not registered',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingAccount.password,
    );
    if (!isPasswordCorrect) {
      throw new RpcException({
        message: 'Password not correct',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const infor = await this.prisma.account.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        createdDate: true,
        updatedDate: true,
        user: true,
      },
    });
    const payload = {
      ...infor,
    };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
  async createAccountforUser(
    id: number,
    createAccountForUser: createAccountforUser,
  ) {
    const { password } = createAccountForUser;
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.account.create({
      data: {
        email: user.email,
        password: hashedPassword,
      },
    });
  }

  async createUser(createUserDto: CreateUserDto) {
    const { password, email, ...data } = createUserDto;

    const emailExist = await this.prisma.user.findUnique({ where: { email } });
    if (emailExist) {
      throw new RpcException({
        message: 'Email already exists',
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        ...data, // Các thông tin khác từ CreateUserDto
        email,
        Account: {
          create: {
            password: hashedPassword,
          },
        },
      },
      include: {
        Account: {
          select: {
            id: true,
            email: true,
            createdDate: true,
            updatedDate: true,
          },
        }, // Bao gồm Account khi trả về kết quả
      },
    });
  }

  getUsers() {
    return this.prisma.user.findMany({
      include: {
        Account: {
          select: {
            id: true,
            email: true,
            createdDate: true,
            updatedDate: true,
          },
        },
        files: true,
      },
    });
  }

  async getUserById(id: number) {
    const findUser = await this.prisma.user.findUnique({ where: { id } });
    if (!findUser)
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        Account: {
          select: {
            id: true,
            email: true,
            createdDate: true,
            updatedDate: true,
          },
        },
        files: true,
      },
    });
  }

  async deleUserById(id: number) {
    const findUser = await this.prisma.user.findUnique({ where: { id } });
    if (!findUser)
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    await this.prisma.user.delete({ where: { id } });
    return `User with ID ${id} successfully deleted`;
  }

  async updateUserById(id: number, data: Prisma.UserUpdateInput) {
    const findUser = await this.prisma.user.findUnique({ where: { id } });
    if (!findUser)
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    if (data.email) {
      const findUser = await this.prisma.user.findUnique({
        where: { email: data.email as string },
      });
      if (findUser)
        throw new RpcException({
          message: 'Email already exists',
          statusCode: HttpStatus.BAD_REQUEST,
        });
    }
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        include: {
          Account: {
            select: {
              id: true,
              email: true,
              createdDate: true,
              updatedDate: true,
            },
          },
          files: true,
        },
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw new HttpException('Error updating user', 500);
    }
  }

  async uploadava(id, avapath, sizepath, typepath) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.prisma.files.create({
      data: {
        avatar: avapath,
        size_image: sizepath,
        type_image: typepath,
        userId: id,
      },
    });
  }

  async uploadfile(id, filepath, sizepath, typepath) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new RpcException({
        message: 'User not found',
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return this.prisma.files.create({
      data: {
        file: filepath,
        size_file: sizepath,
        type_file: typepath,
        userId: id,
      },
    });
  }
}
