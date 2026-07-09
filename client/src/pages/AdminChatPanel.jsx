import { useState, useEffect } from "react";
import { ChatBox } from "../components/ChatBox";
import { apiFetch } from "../utils/api";
import { useUserContext } from "../UserContext";
import { backend_base_url } from "../workMode";

export const AdminChatPanel = ({ socket }) => {
	const [chatRooms, setChatRooms] = useState([]);
	const [selectedRoomId, setSelectedRoomId] = useState(null);
	const { user } = useUserContext();

	// console.log("user in AdminChatPanel: ", user);

	// Fetch sidebar chats on mount
	useEffect(() => {
		const fetchRooms = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/chat/rooms`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const res = await response.json();
					setChatRooms(res);
				}
			} catch (err) {
				console.error("Failed to fetch chat rooms: ", err.message);
			}
		};

		fetchRooms();

		// Pro-Tip: In a full production app, you would also listen to socket events here
		// to move a room to the top of the list when a new message arrives!
	}, []);

	const formatTime = (isoString) => {
		return new Date(isoString).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="flex h-[600px] w-full max-w-5xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xl">
			{/* LEFT SIDEBAR: List of active chats */}
			<div className="w-1/3 border-r border-gray-300 bg-gray-50 flex flex-col">
				<div className="bg-gray-200 p-4 font-bold border-b border-gray-300">
					Active Chats ({chatRooms.length})
				</div>

				<div className="flex-1 overflow-y-auto">
					{chatRooms.map((room) => (
						<div
							key={room._id}
							onClick={() => setSelectedRoomId(room._id)}
							className={`p-4 border-b cursor-pointer transition ${
								selectedRoomId === room._id
									? "bg-[#ebebeb]"
									: "hover:bg-gray-100"
							}`}
						>
							<div className="flex justify-between items-baseline mb-1">
								{/* In a real app, you might join this with the User collection to show a name */}
								<h4 className="font-semibold text-gray-800 truncate">
									Customer: {room._id}
								</h4>

								<span className="text-xs text-gray-500">
									{formatTime(room.lastUpdatedAt)}
								</span>
							</div>

							<p className="text-sm text-gray-600 truncate">
								{room.lastSenderRole === "admin" ? "You: " : ""}{" "}
								{room.latestMessage}
							</p>
						</div>
					))}

					{chatRooms.length === 0 && (
						<div className="p-6 text-center text-gray-500">
							No active chats
						</div>
					)}
				</div>
			</div>

			{/* RIGHT ChatBox */}
			<div className="w-2/3 bg-[#e5ddd5] flex items-center justify-center">
				{selectedRoomId ? (
					<div className="w-full h-full flex flex-col">
						<ChatBox chatRoomId={selectedRoomId} />
					</div>
				) : (
					<div className="text-gray-500 bg-white/50 px-6 py-2 rounded-full shadow-sm">
						Select a chat to start messaging
					</div>
				)}
			</div>
		</div>
	);
};
