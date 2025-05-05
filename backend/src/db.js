import { Redis } from '@upstash/redis';

// 检查是否提供了 Upstash Redis 的环境变量
const useUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

let redis;

if (useUpstash) {
  // 使用 Upstash Redis
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('Using Upstash Redis');
} else {
  // 使用本地 Redis
  redis = new RedisLocal({
    host: '127.0.0.1', // 本地 Redis 地址
    port: 6379,        // 本地 Redis 默认端口
  });
  console.log('Using local Redis');
}

// 测试连接
const testConnection = async () => {
  try {
    await redis.set('test', 'connection');
    await redis.del('test');
    console.log('Redis connection successful');
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
};

// 初始化数据
const initializeData = async () => {
  try {
    const admins = await redis.get('admins');
    const games = await redis.get('games');
    const sessions = await redis.get('sessions');
    
    if (!admins || !games || !sessions) {
      await redis.set('admins', JSON.stringify({}));
      await redis.set('games', JSON.stringify({}));
      await redis.set('sessions', JSON.stringify({}));
      console.log('Initialized Redis data');
    }
  } catch (error) {
    console.error('Error initializing Redis data:', error);
    throw error;
  }
};

// 导出连接和初始化函数
export { redis, testConnection, initializeData }; 