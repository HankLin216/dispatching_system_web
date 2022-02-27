import Redis, { Redis as TRedis } from "ioredis";

class RedisProvider {
  private static reidsInstance: TRedis;

  private constructor() {}

  public static getRedisInstance(): TRedis {
    if (!RedisProvider.reidsInstance) {
      RedisProvider.reidsInstance = new Redis(
        parseInt(process.env.REDIS_PORT ?? "0", 10),
        process.env.REDIS_HOST,
      );
    }
    return RedisProvider.reidsInstance;
  }
}

export default RedisProvider;
