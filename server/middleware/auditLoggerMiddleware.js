import { AuditLog } from "../model/AuditLogModel.js";
import { auditQueue } from "../utils/auditQueue.js";

/**
 * This middleware hooks into Express's res.on("finish") event.
 * It executes after the request controller completes, ensuring that audit logs are
 * generated only if the operation succeeded (statusCode < 400).
 */

export const auditLoggerMiddleware = (action, targetEntityType) => {
	return async (req, res, next) => {
		/***
		 * We have to Intercept both the `req` and `res` bodies early
		 * because the moment we encounter the "finish" event,
		 * ExpressJS might have already dumped them out of memory.
		 */
		const userId = req.user._id;
		const userEmail = req.user.email;
		const method = req.method;
		const url = req.originalUrl;
		const urlParams = req.params;
		const queryParams = req.query;
		const reqBody = req.body;
		const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
		const userAgent = req.headers["user-agent"] || "Unknown";
		let resBody = null;
		const originalSend = res.send;
		res.send = function (body) {
			resBody = typeof body === "string" ? JSON.parse(body) : body;
			return originalSend.apply(res, arguments);
		};

		// await new Promise((resolve, reject) => {
		// 	setTimeout(() => {
		// 		resolve();
		// 	}, 5000);
		// });

		/***
		 * workflow skips below event listener and jumps to `next()`.
		 * Upon res cycle completion, we get back to below event listener.
		 */

		res.on("finish", async () => {
			if (res.statusCode >= 200 && res.statusCode < 400) {
				try {
					/***
					 * Enqueue job to Redis (Non-blocking operation) upon "finish" event
					 */
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

					console.log("job added to bullmq queue.");
				} catch (err) {
					console.error(
						"❌ Failed to push audit job to queue:",
						err.message,
					);
				}
			}
		});

		next();
	};
};
