import { Queue } from "bullmq";
import { bullMqQueueConnection } from "./redis.js";

export const AUDIT_QUEUE_NAME = "audit-log-queue";

export const auditQueue = new Queue(AUDIT_QUEUE_NAME, {
	connection: bullMqQueueConnection,
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: "exponential",
			delay: 1000, // Retry after 1s, 2s, 4s
		},
		removeOnComplete: 100, // Keep last 100 completed jobs in Redis for telemetry
		removeOnFail: 500, // Keep failed jobs for inspection
	},
});
