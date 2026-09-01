import Redis from "ioredis";
import { mode } from "../workMode.js";
import "dotenv/config";

/***
 * FACTORY PATTERN
 */

/***
 * FACTORY PATTERN
 * Generate config based on environment and usage type
 */
const getRedisConfig = (isBullMq = false) => {
	const isProd = mode === "prod";

	const baseConfig = {
		family: 4,
		...(isProd
			? { tls: { rejectUnauthorized: false } }
			: {
					host: process.env.REDIS_HOST,
					port: process.env.REDIS_PORT,
				}),
	};
	const connectionString = isProd ? process.env.REDIS_URL : undefined;

	return {
		connectionString,
		options: {
			...baseConfig,
			/***
			 * BullMQ requires null for BOTH Queue producers and Worker consumers
			 */
			maxRetriesPerRequest: isBullMq ? null : 1,
		},
	};
};

/***
 * FACTORY PATTERN
 * Generate redis instance
 */
export const createRedisInstance = (isBullMq = false) => {
	const config = getRedisConfig(isBullMq);
	const instance = config.connectionString
		? new Redis(config.connectionString, config.options)
		: new Redis(config.options);

	return instance;
};

/***
 * Connection for normal backend caching
 */
export const redisConnection = createRedisInstance(false);
redisConnection.on("connect", () =>
	console.log("✅ Connected to Redis Cache."),
);

/***
 * Dedicated connection for BullMQ Queues (Producers)
 */
export const bullMqProducerRedisConnection = createRedisInstance(true);
bullMqProducerRedisConnection.on("connect", () =>
	console.log("✅ Connected to Redis BullMQ Queue."),
);

/***
 * Dedicated connection for BullMQ Workers (Consumers)
 */
export const bullMqConsumerRedisConnection = createRedisInstance(true);
bullMqConsumerRedisConnection.on("connect", () =>
	console.log("✅ Connected to Redis BullMQ Worker."),
);
