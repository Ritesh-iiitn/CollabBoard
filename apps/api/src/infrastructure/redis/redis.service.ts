import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis | null = null;

  getClient(): Redis | null {
    const url = process.env.REDIS_URL;
    if (!url) return null;
    if (!this.client) {
      this.client = new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true });
      this.client.connect().catch(() => {
        console.warn('[Redis] Connection failed — running without Redis');
      });
    }
    return this.client;
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }
}
