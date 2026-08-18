import Redis from "ioredis";
import { mode } from "../workMode.js";
import "dotenv/config";

/***
 * For local development, use dockerized redis container.
 * For production, use Upstash redis connection
 */
let redis;
if (mode === "dev") {
	redis = new Redis({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
		family: 4, // Forces IPv4
	});
} else {
	redis = new Redis(process.env.REDIS_URL, {
		tls: {
			rejectUnauthorized: false,
		},
	});
}

redis.on("connect", () => {
	console.log("✅ Connected to Redis.");
});

redis.on("error", (err) => {
	console.error("❌ No Redis connection: ", err);
});

export default redis;
