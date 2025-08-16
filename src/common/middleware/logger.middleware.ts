import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (!isDevelopment) {
      next();
      return;
    }

    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();

    // Log request details
    this.logger.log(`🚀 [${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);

    // Log request body for POST/PUT/PATCH (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH'].includes(method) && req.body) {
      const sanitizedBody = this.sanitizeBody(req.body);
      this.logger.debug(`📦 Request Body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log query parameters
    if (Object.keys(req.query).length > 0) {
      this.logger.debug(`🔍 Query Params: ${JSON.stringify(req.query)}`);
    }

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const statusEmoji = this.getStatusEmoji(statusCode);
      this.logger.log(
        `${statusEmoji} [${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode}`,
      );
    });

    next();
  }

  private sanitizeBody(body: any): any {
    if (typeof body !== 'object' || body === null) {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key'];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private getStatusEmoji(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return '✅';
    if (statusCode >= 300 && statusCode < 400) return '🔄';
    if (statusCode >= 400 && statusCode < 500) return '⚠️';
    if (statusCode >= 500) return '❌';
    return '📝';
  }
}
