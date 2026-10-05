import mongoose from "mongoose";
import { IUser } from "./userModel.js";

export interface INotification {
	_id: mongoose.Types.ObjectId;
	message: string;
	isRead: boolean;
	link?: string;
	recipientId: mongoose.Types.ObjectId | IUser;
	type: "order" | "chat";
	createdAt: Date;
	updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
	{
		message: { type: String, required: true },
		isRead: { type: Boolean, required: true, default: false },
		link: { type: String }, // URL to redirect after click
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: ["order", "chat"],
			required: true,
		},
	},
	{ timestamps: true },
);

export const Notification = mongoose.model<INotification>(
	"Notification",
	notificationSchema,
);
