import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		/***
		 * 1. In a chat, one party is `customer`, and the other is `admin`
		 * 2. as admin is fixed, so `User ID` should be the `roomId`.
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

export const Message = mongoose.model("Message", messageSchema);
