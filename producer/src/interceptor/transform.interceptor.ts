import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE } from 'src/auth/auth.decorator';

interface Response<T> {
  statusCode: number;
  message: string | null;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const responseMessage = this.reflector.get<string>(
          RESPONSE_MESSAGE,
          context.getHandler(),
        );

        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message: responseMessage || null, // Sử dụng message từ metadata hoặc null nếu không có
          data, // Trả về dữ liệu từ handler
        };
      }),
    );
  }
}
