const redis = require("redis");

let redisClient = null;

/**
 * Initialize Redis client
 */
async function initRedis() {
	try {
		const redisHost = process.env.REDIS_HOST || "localhost";
		const redisPort = process.env.REDIS_PORT || 6379;

		redisClient = redis.createClient({
			socket: {
				host: redisHost,
				port: redisPort,
			},
		});

		redisClient.on("error", (err) => {
			console.error("Redis Client Error:", err);
		});

		redisClient.on("connect", () => {
			console.log(`Redis connected to ${redisHost}:${redisPort}`);
		});

		await redisClient.connect();
		return redisClient;
	} catch (error) {
		console.error("Failed to initialize Redis:", error);
		return null;
	}
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
	return redisClient;
}

/**
 * Cache data with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
async function setCache(key, value, ttl = 300) {
	if (!redisClient) return false;
	try {
		await redisClient.setEx(key, ttl, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error("Redis setCache error:", error);
		return false;
	}
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {any} Cached value or null
 */
async function getCache(key) {
	if (!redisClient) return null;
	try {
		const data = await redisClient.get(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error("Redis getCache error:", error);
		return null;
	}
}

/**
 * Delete cached data
 * @param {string} key - Cache key
 */
async function deleteCache(key) {
	if (!redisClient) return false;
	try {
		await redisClient.del(key);
		return true;
	} catch (error) {
		console.error("Redis deleteCache error:", error);
		return false;
	}
}

/**
 * Clear all cache
 */
async function clearCache() {
	if (!redisClient) return false;
	try {
		await redisClient.flushAll();
		return true;
	} catch (error) {
		console.error("Redis clearCache error:", error);
		return false;
	}
}

module.exports = {
	initRedis,
	getRedisClient,
	setCache,
	getCache,
	deleteCache,
	clearCache,
};
