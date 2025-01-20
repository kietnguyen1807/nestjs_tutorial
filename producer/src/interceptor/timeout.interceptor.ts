// import {
//   CallHandler,
//   ExecutionContext,
//   HttpException,
//   HttpStatus,
//   Injectable,
//   NestInterceptor,
// } from '@nestjs/common';
// @Injectable()
// export class TimeoutInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler) {
//     const response = context.switchToHttp().getResponse();
//     response.setTimeout(3000, () => {
//       // Khi hết thời gian, ném ra lỗi timeout
//       throw new HttpException('Request Timeout', HttpStatus.REQUEST_TIMEOUT);
//     });
//     return next.handle();
//   }
// }
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return new Observable((observer) => {
      // Thời gian timeout (3 giây)
      const timeout = setTimeout(() => {
        observer.error(
          new HttpException('Request Timeout', HttpStatus.REQUEST_TIMEOUT),
        );
      }, 20000); // 3000ms = 3s

      next.handle().subscribe({
        next: (data) => {
          clearTimeout(timeout); // Nếu yêu cầu hoàn tất trước timeout, xóa timeout
          observer.next(data);
          observer.complete();
        },
        error: (err) => {
          clearTimeout(timeout); // Xóa timeout nếu có lỗi trong quá trình xử lý
          observer.error(err);
        },
      });
    });
  }
}
