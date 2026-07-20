import { Message } from "../model/Message.js";

export const getChatRooms = async (req, res) => {
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
		const recentChats = await Message.aggregate([
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
		]);

		res.status(200).json(recentChats);
	} catch (error) {
		console.error("Error fetching chat rooms: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getRoomMessages = async (req, res) => {
	try {
		const messages = await Message.find({ roomId: req.params.roomId }).sort(
			{ createdAt: 1 },
		);
		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
