import { RequestHandler } from "express";
import { IMessage, Message } from "../model/Message.js";

interface IChatRoomSummary {
	_id: string;
	roomName: string;
	latestMessage: string;
	lastUpdatedAt: Date;
	lastSenderRole: "user" | "admin";
}

/**
 * Fetch the list of all active chat rooms sorted
 * by the latest activity in the sidebar.
 */
export const getChatRooms: RequestHandler<
	{},
	IChatRoomSummary[] | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		/***
		 * This aggregation pipeline is responsible to show the chat heads of the sidebar.
		 * Stage 1: 
		 * 		{ $sort: { createdAt: -1 } }
				Sorts every message document by their creation time. It puts the newest messages at the beginning of the stream.
			 
		   Stage 2: 
				$group: {
					_id: "$roomId",
					latestMessage: { $first: "$text" },
					lastUpdatedAt: { $first: "$createdAt" },
					lastSenderRole: { $first: "$senderRole" }
				}
			
				_id: "$roomId": Collapses the sorted stream into buckets based on the chat room.
				$first Accumulator: Extracts data from the absolute first document it encounters in each bucket.
				The Logic: Because Stage 1 sorted everything newest-first, the "first" document in each room bucket is guaranteed to be 
				that room's latest message.
				Output: This stage reduces your massive list of messages down to a single document per unique room.
			
			Stage 3: 
				$sort (Final Presentation Sorting)
			
				Re-sorts the newly created room summary documents.
				Why it matters: It ensures the chat rooms with the absolute freshest activity appear first.
				Real-world use: This mimics the inbox behavior of apps like WhatsApp or Slack, where active chats jump to the top of your screen.
		 */
		if (!req.user || req.user?.role !== "admin") {
			return res.status(401).json({
				message: "You are not allowed to get the chat rooms.",
			});
		}

		const recentChats = (await Message.aggregate([
			// 1. Sort all messages by newest first
			{ $sort: { createdAt: -1 } },

			// 2. Group by roomId, keeping only the first (newest) message data
			{
				$group: {
					_id: "$roomId", // The group key becomes the roomId
					roomName: { $first: "$roomName" }, // Capture the room name from the first message in the group
					latestMessage: { $first: "$text" },
					lastUpdatedAt: { $first: "$createdAt" },
					lastSenderRole: { $first: "$senderRole" },
				},
			},

			// 3. Sort the resulting groups by whoever messaged most recently
			{ $sort: { lastUpdatedAt: -1 } },
		])) as IChatRoomSummary[];

		return res.status(200).json(recentChats);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error fetching chat rooms: ", error.message);
		}
		return res.status(500).json({ message: "Error fetching chat rooms" });
	}
};

export const getRoomMessages: RequestHandler<
	{ roomId: string },
	{ roomId: string; messages: IMessage[] } | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const { roomId } = req.params;

		if (!roomId || roomId.trim() === "") {
			return res
				.status(400)
				.json({ message: "Room ID parameter is missing or invalid." });
		}

		const messages = await Message.find({ roomId: roomId })
			.sort({ createdAt: 1 })
			.lean();

		return res.status(200).json({
			roomId: roomId,
			messages: messages,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("error in getRoomMessages: ", error.message);
		}
		return res
			.status(500)
			.json({ message: "Error fetching room messages" });
	}
};

export const getRoomName: RequestHandler<
	{ roomId: string },
	string | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const { roomId } = req.params;

		if (!roomId || roomId.trim() === "") {
			return res
				.status(400)
				.json({ message: "Room ID parameter is missing or invalid." });
		}

		const message = await Message.findOne({
			roomId: roomId,
		}).lean();
		// console.log("room name: ", message.roomName);

		if (!message) {
			return res
				.status(404)
				.json({ message: "Chat room name not found." });
		}

		return res.status(200).json(message.roomName);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("error in getRoomName: ", error.message);
		}
		return res.status(500).json({ message: "Error fetching room name" });
	}
};
