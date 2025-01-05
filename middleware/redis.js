// redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Listen for connection errors
redisClient.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

 

export default redisClient;
