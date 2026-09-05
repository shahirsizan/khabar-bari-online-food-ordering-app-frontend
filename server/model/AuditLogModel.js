import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			/***
			 * Mongoose assumes `userId` references the `_id` (primary key) field of documents in User collection.
			 */
			required: true,
			index: true,
		},
		userEmail: {
			type: String,
		},
		action: {
			type: String,
			required: true,
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
			index: true,
		},
		targetEntityType: {
			type: String,
			required: true,
			enum: ["MenuItem", "Order", "User"],
			index: true,
		},
		details: {
			method: { type: String },
			url: { type: String, default: null },
			urlParams: { type: Object, default: null },
			queryParams: { type: Object, default: null },
			reqBody: { type: Object },
			resBody: { type: Object },
		},
		ipAddress: {
			type: String,
			default: "Unknown",
		},
		userAgent: {
			type: String,
			default: "Unknown",
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

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
