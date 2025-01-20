// get-request.interceptor.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
@Injectable()
export class GetRequestInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    if (request.method === 'GET') {
      //   console.log(`GET request received at: ${request.url}`);
      const getCache = await this.cacheManager.get(`user: ${request.url}`);
      if (getCache) {
        // console.log(`Returning cached user: ${request.params.id}`);
        return new Observable((observer) => {
          observer.next(getCache);
          observer.complete();
        });
      }
      return next.handle().pipe(
        tap((data) => {
          if (request.method === 'GET' && data) {
            this.cacheManager.set(`user: ${request.url}`, data, {
              ttl: 10,
            });
          }
        }),
      );
    }

    return next.handle();
  }
}
function pipe(arg0: MonoTypeOperatorFunction<unknown>) {
  throw new Error('Function not implemented.');
}
