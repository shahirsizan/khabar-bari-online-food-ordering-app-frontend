import Redis from "ioredis";

const redis = new Redis({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	family: 4, // Forces IPv4
});

redis.on("connect", () => {
	console.log("✅ Connected to Redis.");
});

redis.on("error", (err) => {
	console.error("❌ No Redis connection: ", err);
});

export default redis;
