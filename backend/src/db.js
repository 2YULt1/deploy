import { Redis } from '@upstash/redis';

// 验证环境变量
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Redis environment variables');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

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