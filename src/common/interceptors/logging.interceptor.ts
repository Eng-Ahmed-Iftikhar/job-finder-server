import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (!isDevelopment) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `📥 ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = response.statusCode;

          // Log successful response
          this.logger.log(
            `✅ ${method} ${url} - ${statusCode} - ${duration}ms - Response: ${
              data
                ? JSON.stringify(data).substring(0, 100) +
                  (JSON.stringify(data).length > 100 ? '...' : '')
                : 'No content'
            }`,
          );
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = error.status || 500;

          // Log error response
          this.logger.error(
            `❌ ${method} ${url} - ${statusCode} - ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
