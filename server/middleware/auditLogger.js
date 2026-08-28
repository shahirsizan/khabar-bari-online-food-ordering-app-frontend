import { AuditLog } from "../model/AuditLogModel.js";
import { getIO } from "../utils/io.js";

/**
 * This middleware hooks into Express's res.on("finish") event.
 * It executes after the request controller completes, ensuring that audit logs are
 * generated only if the operation succeeded (statusCode < 400).
 */

export const auditLogger = (action, targetEntityType) => {
	return (req, res, next) => {
		res.on("finish", async () => {
			if (res.statusCode >= 200 && res.statusCode < 400) {
				try {
					const targetId =
						req.params.id || req.body.id || req.body._id || null;
					const ipAddress =
						req.headers["x-forwarded-for"] ||
						req.socket.remoteAddress ||
						"Unknown";
					const userAgent = req.headers["user-agent"] || "Unknown";

					// Sanitize sensitive body fields
					const sanitizedBody = { ...req.body };
					delete sanitizedBody.password;
					delete sanitizedBody.confirmPassword;
					delete sanitizedBody.token;

					const logEntry = await AuditLog.create({
						userId: req.user._id,
						userEmail: req.user.email,
						action: action,
						targetEntityType: targetEntityType,
						targetId: targetId ? targetId.toString() : null,
						details: {
							method: req.method,
							url: req.originalUrl,
							urlParams: req.params,
							queryParams: req.query,
							body:
								Object.keys(sanitizedBody).length > 0
									? sanitizedBody
									: undefined,
						},
						ipAddress,
						userAgent,
					});
				} catch (err) {
					console.error("❌ Audit Logging Error: ", err.message);
				}
			}
		});

		next();
	};
};
