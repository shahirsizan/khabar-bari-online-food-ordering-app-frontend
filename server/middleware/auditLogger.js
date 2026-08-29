import { AuditLog } from "../model/AuditLogModel.js";

/**
 * This middleware hooks into Express's res.on("finish") event.
 * It executes after the request controller completes, ensuring that audit logs are
 * generated only if the operation succeeded (statusCode < 400).
 */

const SENSITIVE_KEYS = new Set([
	"password",
	"confirmpassword",
	"token",
	"accesstoken",
	"refreshtoken",
]);

/**
 * Recursively sanitize sensitive keys and truncate data to prevent size limit violation
 */
const sanitizeAndTruncate = (obj, maxStringLen = 400) => {
	if (!obj || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => {
			return sanitizeAndTruncate(item, maxStringLen);
		});
	}

	const cleanedObj = {};
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
};

export const auditLogger = (action, targetEntityType) => {
	return (req, res, next) => {
		res.on("finish", async () => {
			if (res.statusCode >= 200 && res.statusCode < 400) {
				try {
					const targetId =
						req.params.id || req.body.id || req.body._id || null;
					const ipAddress =
						req.ip || req.socket.remoteAddress || "Unknown";
					const userAgent = req.headers["user-agent"] || "Unknown";

					// Sanitize sensitive body fields
					const sanitizedBody = sanitizeAndTruncate(req.body);

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
