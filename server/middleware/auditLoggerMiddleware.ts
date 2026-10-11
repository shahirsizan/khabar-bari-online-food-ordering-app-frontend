import { auditQueue } from "../utils/auditQueue.js";
import { AuditAction, AuditTargetEntity } from "../model/AuditLogModel.js";
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * This middleware hooks into Express's res.on("finish") event.
 * It executes after the request controller completes, ensuring that audit logs are
 * generated only if the operation succeeded (statusCode < 400).
 */

export const auditLoggerMiddleware = (
	action: AuditAction,
	targetEntityType: AuditTargetEntity,
): RequestHandler => {
	return async (
		req: Request,
		res: Response,
		next: NextFunction,
	): Promise<void> => {
		if (!req.user) {
			return next();
		}
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
		const ipAddress = req.ip || "Unknown";
		const userAgent = req.headers["user-agent"] || "Unknown";

		let resBody: any = null;
		// Hijacking the Express response streaming method to extract response data copies
		const originalSend = res.send;
		res.send = function (body: any): Response {
			resBody = typeof body === "string" ? JSON.parse(body) : body;
			return originalSend.apply(res, arguments as any);
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

		res.on("finish", async (): Promise<void> => {
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
				} catch (err: unknown) {
					if (err instanceof Error) {
						console.error(
							"❌ Failed to push audit job to queue:",
							err.message,
						);
					}
				}
			}
		});

		next();
	};
};
