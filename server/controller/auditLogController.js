import { AuditLog } from "../model/AuditLogModel.js";

/**
 * Get all audit logs
 * with search, filtering, and pagination facility
 */
export const getAuditLogs = async (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "You are not admin" });
	}

	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;
		const { action, targetEntityType, search } = req.query;

		const dynamicQuery = {};

		if (action) {
			dynamicQuery.action = action;
		}
		if (targetEntityType) {
			dynamicQuery.targetEntityType = targetEntityType;
		}
		/***
		 * `search` is applied over everything for partial match.
		 */
		if (search) {
			dynamicQuery.$or = [
				{ userEmail: { $regex: search, $options: "i" } },
				{ action: { $regex: search, $options: "i" } },
				{ targetEntityType: { $regex: search, $options: "i" } },
			];
		}

		const [logs, total] = await Promise.all([
			AuditLog.find(dynamicQuery)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.populate("userId", "name email phone role", "User")
				.lean(),
			AuditLog.countDocuments(dynamicQuery),
		]);
		const totalPages = Math.ceil(total / limit) || 1;

		return res.status(200).json({
			success: true,
			logs: logs,
			pagination: {
				total,
				page,
				pages: totalPages,
				limit,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "অডিট লগ কার্যক্রম ব্যর্থ হয়েছে!",
			error: error.message,
		});
	}
};

/**
 * Get single audit log
 */
export const getAuditLogById = async (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "You are not admin" });
	}

	try {
		const log = await AuditLog.findById(req.params.id)
			.populate("userId", "name email phone role", "User")
			.lean();

		if (!log) {
			return res
				.status(404)
				.json({ message: "কোনো অডিট লগ পাওয়া যায়নি!" });
		}

		return res.status(200).json({ success: true, log: log });
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "অডিট লগ কার্যক্রম ব্যর্থ হয়েছে!",
			error: error.message,
		});
	}
};
