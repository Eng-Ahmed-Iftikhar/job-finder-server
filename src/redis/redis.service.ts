import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('✅ Connected to Redis server');
      }
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('❌ Disconnected from Redis server');
      }
    }
  }

  // Store refresh token with access token as key
  async storeRefreshToken(
    accessToken: string,
    refreshToken: string,
    expirationTime: number,
  ): Promise<void> {
    const key = `refresh_token:${accessToken}`;
    await this.client.setEx(key, expirationTime, refreshToken);

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`🔐 Stored refresh token for access token`);
    }
  }

  // Get refresh token by access token
  async getRefreshToken(accessToken: string): Promise<string | null> {
    const key = `refresh_token:${accessToken}`;
    const refreshToken = await this.client.get(key);

    if (process.env.NODE_ENV !== 'production' && refreshToken) {
      this.logger.debug(`🔍 Retrieved refresh token for access token`);
    }

    return refreshToken;
  }

  // Delete refresh token
  async deleteRefreshToken(accessToken: string): Promise<void> {
    const key = `refresh_token:${accessToken}`;
    await this.client.del(key);

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`🗑️ Deleted refresh token for access token`);
    }
  }

  // Store user session data
  async storeUserSession(
    userId: string,
    sessionData: any,
    expirationTime: number,
  ): Promise<void> {
    const key = `user_session:${userId}`;
    await this.client.setEx(key, expirationTime, JSON.stringify(sessionData));
  }

  // Get user session data
  async getUserSession(userId: string): Promise<any | null> {
    const key = `user_session:${userId}`;
    const sessionData = await this.client.get(key);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  // Delete user session
  async deleteUserSession(userId: string): Promise<void> {
    const key = `user_session:${userId}`;
    await this.client.del(key);
  }

  // Check if token exists (blacklist functionality)
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `blacklist:${token}`;
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  // Blacklist a token
  async blacklistToken(token: string, expirationTime: number): Promise<void> {
    const key = `blacklist:${token}`;
    await this.client.setEx(key, expirationTime, 'blacklisted');
  }
}
