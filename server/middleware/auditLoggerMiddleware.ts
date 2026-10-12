import { auditQueue } from "../utils/auditQueue.js";
import {
	AuditAction,
	AuditTargetEntity,
	IAuditLog,
} from "../model/AuditLogModel.js";
import { NextFunction, Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";

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
		// Hijacking the Express response streaming method to extract response data copies
		let resBody: any = null;
		const originalSend = res.send;
		res.send = function (body: any): Response {
			resBody = typeof body === "string" ? JSON.parse(body) : body;
			return originalSend.apply(res, arguments as any);
		};

		if (!req.user) {
			console.log("auditlog middleware: No `user`...");
		}
		/***
		 * We have to Intercept both the `req` and `res` bodies early
		 * because the moment we encounter the "finish" event,
		 * ExpressJS might have already dumped them out of memory.
		 */

		const userId = req.user?._id || null;
		const userEmail = req.user?.email || null;
		const method = req.method;
		const url = req.originalUrl;
		const urlParams = req.params;
		const queryParams = req.query;
		const reqBody = { ...req.body };
		/***
		 * mask the passwords no matter what
		 */
		if (reqBody.password) {
			reqBody.password = "********";
		}
		if (reqBody.confirmPassword) {
			reqBody.confirmPassword = "********";
		}
		if (reqBody.newPassword) {
			reqBody.newPassword = "********";
		}

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
					const data: IAuditLog = {
						userId:
							userId ||
							new mongoose.Types.ObjectId(resBody.userObj._id),
						userEmail: userEmail || resBody.userObj.email,
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
					};

					// console.log("data: ", data);

					await auditQueue.add("new-audit-log", data);
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
