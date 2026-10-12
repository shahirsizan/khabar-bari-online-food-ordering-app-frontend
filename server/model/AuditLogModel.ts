import mongoose from "mongoose";
import { IUser } from "./userModel.js";

export type AuditAction =
	| "CREATE_MENU_ITEM"
	| "UPDATE_MENU_ITEM"
	| "DELETE_MENU_ITEM"
	| "PLACE_ORDER"
	| "UPDATE_ORDER_STATUS"
	| "DELETE_USER"
	| "UPDATE_USER"
	| "RESET_USER_PASSWORD";

export type AuditTargetEntity = "MenuItem" | "Order" | "User";

export interface IAuditLog {
	_id?: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId | IUser;
	userEmail: string;
	action: AuditAction;
	targetEntityType: AuditTargetEntity;
	details: {
		method: string;
		url: string;
		urlParams: Record<string, any>;
		queryParams: Record<string, any>;
		reqBody: Record<string, any>;
		resBody: Record<string, any>;
	};
	createdAt?: Date;
	updatedAt?: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		userEmail: {
			type: String,
		},
		action: {
			type: String,
			enum: [
				"CREATE_MENU_ITEM",
				"UPDATE_MENU_ITEM",
				"DELETE_MENU_ITEM",
				"PLACE_ORDER",
				"UPDATE_ORDER_STATUS",
				"DELETE_USER",
				"UPDATE_USER",
				"RESET_USER_PASSWORD",
			],
		},
		targetEntityType: {
			type: String,
			enum: ["MenuItem", "Order", "User"],
			index: true,
			required: true,
		},
		details: {
			method: { type: String },
			url: { type: String },
			urlParams: { type: Object },
			queryParams: { type: Object },
			reqBody: { type: Object },
			resBody: { type: Object },
		},
	},
	{
		timestamps: true,
	},
);

/**
 * Compound Indexes for high-performance filtering & sorting
 */
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1, action: 1 });

/***
 * Automatically delete logs after 6 hours (21600 seconds)
 */
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 21600 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
