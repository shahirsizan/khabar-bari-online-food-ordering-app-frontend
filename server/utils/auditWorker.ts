import { Worker } from "bullmq";
import { bullMqConsumerRedisConnection } from "./redis.js";
import { AUDIT_QUEUE_NAME } from "./auditQueue.js";
import { AuditLog, IAuditLog } from "../model/AuditLogModel.js";

type SanitizeInput = unknown;
type SanitizeOutput = any;

const SENSITIVE_KEYS: Set<string> = new Set([
	"password",
	"confirmpassword",
	"token",
	"accesstoken",
	"refreshtoken",
]);

/**
 * Recursively sanitize sensitive keys and truncate data to prevent size limit violation
 */
const sanitizeAndTruncate = (obj, maxStringLen = 300) => {
	if (!obj || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => {
			return sanitizeAndTruncate(item, maxStringLen);
		});
	}

	const cleanedObj: Record<string, any> = {};

	try {
		for (const [key, value] of Object.entries(obj)) {
			if (SENSITIVE_KEYS.has(key.toLowerCase())) {
				cleanedObj[key] = "[SENSITIVE INFO]";
			} else if (typeof value === "string") {
				cleanedObj[key] =
					value.length > maxStringLen
						? `${value.substring(0, maxStringLen)}... [TRUNCATED]`
						: value;
			} else if (typeof value === "object" && value !== null) {
				cleanedObj[key] = sanitizeAndTruncate(value, maxStringLen);
			} else {
				cleanedObj[key] = value;
			}
		}
		return cleanedObj;
	} catch (error) {
		console.error(
			"⚠️ auditWorker: Error processing complex object entries structure:",
			error,
		);
		return "[UNPARSABLE DATA STRUCTURE]";
	}
};

export const initAuditWorker = () => {
	const worker = new Worker<IAuditLog>(
		AUDIT_QUEUE_NAME,
		async (job) => {
			/***
			 * // Enqueued job to Redis
					await auditQueue.add("new-audit-log", {
											userId: userId,
											userEmail: userEmail,
											action: action,
											targetEntityType: targetEntityType,
											details: {
												method: method,
												url: url,
												urlParams: urlParams,
												queryParams: queryParams,
												reqBody: reqBody,
												resBody: resBody,
											},
											ipAddress,
											userAgent,
						});
			 */
			const data: IAuditLog = job.data;
			const sanitizedReqBody = sanitizeAndTruncate(data.details.reqBody);
			const sanitizedResBody = sanitizeAndTruncate(data.details.resBody);

			/***
			 * To mimic delay
			 */
			// const time1 = Date.now();
			// await new Promise((resolve, reject) => {
			// 	setTimeout(() => {
			// 		resolve();
			// 	}, 7000);
			// });

			/***
			 * Persist to MongoDB
			 */
			const logEntry = await AuditLog.create({
				userId: data.userId,
				userEmail: data.userEmail,
				action: data.action,
				targetEntityType: data.targetEntityType,
				details: {
					method: data.details.method,
					url: data.details.url,
					urlParams: data.details.urlParams,
					queryParams: data.details.queryParams,
					reqBody: sanitizedReqBody,
					resBody: sanitizedResBody,
				},
			});

			console.log("job processed in bullmq queue. Added to mongoDB");

			/***
			 * To mimic delay
			 */
			// const time2 = Date.now();
			// console.log("Total time required: ", time2 - time1);
		},
		{ connection: bullMqConsumerRedisConnection },
	);

	worker.on("failed", (job, err) => {
		console.error(
			`❌ Audit job ${job?.id} failed with error:`,
			err.message,
		);
	});

	console.log("✅ Audit Log Background Worker initialized.");
};
