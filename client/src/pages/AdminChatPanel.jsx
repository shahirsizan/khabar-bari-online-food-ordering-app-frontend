import { useState, useEffect } from "react";
import { ChatBox } from "../components/ChatBox";
import { apiFetch } from "../utils/api";
import { useUserContext } from "../UserContext";
import { backend_base_url } from "../workMode";
import { formatTime } from "../utils/formatTime";

export const AdminChatPanel = () => {
	const [chatRooms, setChatRooms] = useState([]);
	const [selectedRoomId, setSelectedRoomId] = useState(null);
	const [selectedRoomName, setSelectedRoomName] = useState(null);
	const [onlineUserIds, setOnlineUserIds] = useState([]); // Tracks raw online user IDs globally
	const { user, socket } = useUserContext();

	// on mount, fetch sidebar chat list
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
	}, []);

	// Pro-Tip: In a production grade app, we would also like to
	// to move a room to the top of the list when a new message arrives.
	// ℹ️ We are setting up socket listeners to track real time updates
	// LIVE TRACKING SYNC: Intercept real-time alterations
	useEffect(() => {
		if (!socket) {
			return;
		}

		// Fetch initial list of online keys
		socket.emit("get_online_users");

		socket.on("initial_online_list", (ids) => {
			setOnlineUserIds(ids);
		});

		// Listen for live entries/exits
		socket.on("user_status_change", ({ userId, status }) => {
			setOnlineUserIds((prev) => {
				if (status === "online") {
					return [...prev, userId];
				} else {
					return prev.filter((id) => id !== userId);
				}
			});
		});

		return () => {
			socket.off("initial_online_list");
			socket.off("user_status_change");
		};
	}, [socket]);

	if (user.role !== "admin") {
		return (
			<div className="h-[300px] flex items-center justify-center text-2xl font-bold">
				You are not authorized to view this page.
			</div>
		);
	}

	return (
		<div className="flex h-[600px] w-full max-w-5xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xl">
			{/* LEFT SIDEBAR: List of active chats */}
			<div className="w-1/3 border-r border-gray-300 bg-gray-50 flex flex-col">
				<div className="bg-gray-200 p-4 font-bold border-b border-gray-300">
					Active Chats ({chatRooms.length})
				</div>

				<div className="flex-1 overflow-y-auto">
					{chatRooms.length === 0 && (
						<div className="p-6 text-center text-gray-500">
							No active chats
						</div>
					)}

					{chatRooms.map((room) => {
						// compute online/offline status.
						const isOnline = onlineUserIds.includes(room._id);

						return (
							<div
								key={room._id}
								onClick={() => {
									setSelectedRoomId(room._id);
									setSelectedRoomName(room.roomName);
								}}
								className={`p-4 border-b cursor-pointer transition ${
									selectedRoomId === room._id
										? "bg-[#ebebeb]"
										: "hover:bg-gray-100"
								}`}
							>
								<div className="flex justify-between items-baseline mb-1">
									{/* In a real app, you might join this with the User collection to show a name */}
									<h4 className="font-semibold text-gray-800 truncate">
										Customer: {room.roomName}{" "}
									</h4>

									{isOnline ? (
										<span className="h-2 w-2 md:h-4 md:w-4 rounded-full bg-green-800 animate-pulse"></span>
									) : (
										<span className="h-2 w-2 md:h-4 md:w-4 rounded-full bg-red-700 animate-pulse"></span>
									)}

									<span className="text-xs text-gray-500">
										{formatTime(room.lastUpdatedAt)}
									</span>
								</div>

								<p className="text-sm text-gray-600 truncate">
									{room.lastSenderRole === "admin"
										? "You: "
										: ""}{" "}
									{room.latestMessage}
								</p>
							</div>
						);
					})}
				</div>
			</div>

			{/* RIGHT ChatBox */}
			<div className="w-2/3 bg-[#e5ddd5] flex items-center justify-center">
				{selectedRoomId ? (
					<div className="w-full h-full flex flex-col">
						<ChatBox
							chatRoomIdFromAdminPanel={selectedRoomId}
							chatRoomNameFromAdminPanel={selectedRoomName}
						/>
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
