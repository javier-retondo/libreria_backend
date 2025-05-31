import { createClient, RedisClientType } from 'redis';

class RedisManager {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      password: '',
      database: 0,
      socket: {
        port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
        host: process.env.REDIS_HOST || 'localhost',
        family: 4,
      },
    });

    this.client.connect();
    this.client.on('error', (err: any) => {
      console.error(`Error in Redis connection: ${err}`);
    });
    this.client.on('connect', () => console.log('Redis is connected.'));
    this.client.on('ready', () => console.log('Redis is already.'));
    this.client.on('reconnecting', () =>
      console.log('Reconnectingo to Redis...'),
    );
    this.client.on('end', () => console.log('Redis connection is closed.'));
  }

  public async set(
    key: string,
    value: string,
    expitarion: number,
  ): Promise<string | null> {
    return await this.client.set(key, value, {
      EX: expitarion,
    });
  }

  public async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  public async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  public async flushall(): Promise<string> {
    return await this.client.flushAll();
  }

  public async sendCommand(args: string[]): Promise<any> {
    return await this.client.sendCommand(args);
  }
}

export const redisClient = new RedisManager();
