const { createClient } = require('redis');

const redisClient = createClient({
	url: process.env.REDIS_URL
});

redisClient.on('connect', () => {
	console.log('Redis client connected');
});

redisClient.on('error', (error) => {
	console.error(error);
});

module.exports = redisClient;