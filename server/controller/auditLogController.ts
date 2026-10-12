import { RequestHandler } from "express";
import mongoose from "mongoose";
import {
	AuditAction,
	AuditLog,
	AuditTargetEntity,
	IAuditLog,
} from "../model/AuditLogModel.js";
import { createAuditLogQueryBuilder } from "../builder/auditLogQueryBuilder.js";
import { IUser } from "../model/userModel.js";

interface IAuditLogQuery {
	page?: string;
	limit?: string;
	action?: AuditAction;
	targetEntityType?: AuditTargetEntity;
	search?: string;
}
type IPopulatedUser = Pick<IUser, "_id" | "name" | "email" | "phone" | "role">;

export interface IAuditLogWithPopulatedUser extends Omit<IAuditLog, "userId"> {
	userId?: IPopulatedUser | mongoose.Types.ObjectId;
}

interface AuditLogsResponse {
	success: boolean;
	logs: IAuditLogWithPopulatedUser[];
	totalPages: number;
}

/**
 * Get all audit logs
 * with search, filtering, and pagination facility
 */
export const getAuditLogs: RequestHandler<
	{},
	AuditLogsResponse | { message: string },
	{},
	IAuditLogQuery
> = async (req, res) => {
	try {
		if (!req.user || req.user.role !== "admin") {
			return res.status(403).json({ message: "You are not admin" });
		}

		const { page, limit, action, targetEntityType, search } = req.query;

		const pageInt = parseInt(page as string) || 1;
		const limitInt = parseInt(limit as string) || 10;
		const skip = (pageInt - 1) * limitInt;

		/***
		 * Make the mongoose query using Builder Pattern.
		 */
		const dynamicQuery = createAuditLogQueryBuilder()
			.filterByAction(action)
			.filterByTargetEntity(targetEntityType)
			.filterBySearch(search)
			.build();

		const [logs, total] = await Promise.all([
			AuditLog.find(dynamicQuery)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limitInt)
				.populate("userId", "name email phone role", "User")
				.lean(),
			AuditLog.countDocuments(dynamicQuery),
		]);
		const totalPages = Math.ceil(total / limitInt) || 1;

		return res.status(200).json({
			success: true,
			logs: logs,
			totalPages: totalPages,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("getAuditLogs() error: ", error.message);
			return res.status(500).json({
				message: error.message,
			});
		}
		return res.status(500).json({
			message: "getAuditLogs() error",
		});
	}
};
