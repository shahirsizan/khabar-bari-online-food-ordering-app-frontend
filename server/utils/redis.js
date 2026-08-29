import Redis from "ioredis";
import { mode } from "../workMode.js";
import "dotenv/config";

/***
 * FACTORY PATTERN
 */

/***
 * FACTORY PATTERN
 * Generate config based on environment
 */
const getRedisConfig = (isWorker = false) => {
	const baseConfig =
		mode === "dev"
			? {
					host: process.env.REDIS_HOST,
					port: parseInt(process.env.REDIS_PORT),
					family: 4,
				}
			: { tls: { rejectUnauthorized: false } };

	const connectionString =
		mode === "prod" ? process.env.REDIS_URL : undefined;

	return {
		connectionString,
		options: {
			...baseConfig,
			maxRetriesPerRequest: isWorker ? null : 1,
			/***
			 *  Workers must have `null`. Normal cache instances can use default or 1 for fast fail.
			 */
		},
	};
};

/***
 * FACTORY PATTERN
 * Generate redis instance based on purpose
 */
export const createRedisInstance = (isWorker = false) => {
	const config = getRedisConfig(isWorker);
	return config.connectionString
		? new Redis(config.connectionString, config.options)
		: new Redis(config.options);
};

/***
 * Connection for normal caching
 */
export const redis = createRedisInstance(false);

/***
 * Connection for BullMQ workers (consumers).
 */
export const bullMqWorkerConnection = createRedisInstance(true);

/***
 * Connection for BullMQ Queues (producers).
 * Queues/Producers can reuse connection of the caching instance
 */
export const bullMqQueueConnection = redis;

redis.on("connect", () => console.log("✅ Connected to Redis Cache."));
redis.on("error", (err) => console.error("❌ Redis Cache Error: ", err));
