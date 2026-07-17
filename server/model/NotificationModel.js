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
		/***
		 * Below `metadata` is optional. No metadata for chat notification
		 * purpose:
		 *      If the admin marks an order as "Completed", a socket notification hits the frontend.
		 *      Thanks to metadata, our React app doesn't just display a popup message; it can instantly
		 *      read `metadata.orderId` and `metadata.status`, find that specific order in the current
		 *      React state, and flip its badge status dynamically without waiting for the user to manually refresh the page.
		 */
		metadata: {
			orderId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Order",
			},
			status: {
				type: String,
			},
		},
	},
	{ timestamps: true },
);

export const Notification = mongoose.model("Notification", notificationSchema);
