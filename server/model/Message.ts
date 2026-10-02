import mongoose from "mongoose";
import { IUser } from "./userModel.js";

export interface IMessage {
	_id: mongoose.Types.ObjectId;
	roomId: string; // The Customer's User ID string acting as the conversation room room identifier
	roomName: string;
	senderId: mongoose.Types.ObjectId | IUser; // Handles both raw ID string or populated User profile object
	senderRole: "user" | "admin"; // Explicit literal string unions matching your schema enum layout
	text: string;
	createdAt: Date;
	updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
	{
		/***
		 * 1. In a chat, one party is `customer`, and the other is `admin`
		 * 2. as admin is fixed, so `User ID` should be the `roomId`.
		 * 3. No need for receiver id.
		 */
		roomId: { type: String, required: true, index: true },
		roomName: { type: String, required: true },
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		senderRole: {
			type: String,
			enum: ["user", "admin"],
			required: true,
		},
		text: { type: String, required: true },
	},
	{ timestamps: true },
);

messageSchema.index({ createdAt: -1 });

export const Message =
	mongoose.models?.Message ||
	mongoose.model<IMessage>("Message", messageSchema);
