import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		message: { type: String, required: true },
		isRead: { type: Boolean, default: false },
		link: { type: String, required: true }, // URL to redirect after click
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		}, // The user or admin
		type: {
			type: String,
			enum: ["order", "chat"],
			required: true,
		},
	},
	{ timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema);
