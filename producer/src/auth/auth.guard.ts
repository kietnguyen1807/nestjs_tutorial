import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { log } from 'console';
import { Reflector } from '@nestjs/core';
import { jwtConstants } from './constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { ACCESS_KEY, IS_PUBLIC_KEY } from './auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isAccess = this.reflector.getAllAndOverride<boolean>(ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    });
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    request['user'] = payload;
    if (isAccess) {
      return true;
    }
    const email = payload.email;
    const account = await this.prisma.user.findUnique({ where: { email } });
    if (!account) {
      throw new UnauthorizedException();
    }
    if (account.role === 'admin') {
      return true;
    }
    const userIdFromParams = parseInt(request.params.id, 10);
    // Kiểm tra xem ID có hợp lệ không
    if (isNaN(userIdFromParams)) {
      throw new UnauthorizedException();
    }

    const userdb = await this.prisma.user.findUnique({
      where: { id: userIdFromParams },
    });
    if (!userdb) {
      throw new UnauthorizedException();
    }
    if (!userdb.email) {
      throw new UnauthorizedException();
    }
    if (!account.email) {
      throw new UnauthorizedException();
    }
    if (userdb.email === account.email) {
      return true;
    }
    throw new UnauthorizedException();
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
