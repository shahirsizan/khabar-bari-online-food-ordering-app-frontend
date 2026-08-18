import { useState, useEffect } from "react";
import { ChatBox } from "../components/ChatBox";
import { apiFetch } from "../utils/api";
import { useUserContext } from "../UserContext";
import { backend_base_url } from "../workMode";
import { formatTime } from "../utils/formatTime";
import { useNavigate, useParams } from "react-router-dom";

export const AdminChatPanel = () => {
	const navigate = useNavigate();
	const { roomId } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [chatRooms, setChatRooms] = useState([]);
	const [selectedRoomId, setSelectedRoomId] = useState(null);
	const [selectedRoomName, setSelectedRoomName] = useState(null);
	const [onlineUserIds, setOnlineUserIds] = useState([]); // Tracks raw online user IDs globally
	const { user, socket } = useUserContext();

	/***
	 * Fetch left sidebar chat list
	 */
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
			} finally {
				setIsLoading(false);
			}
		};

		fetchRooms();
	}, []);

	/***
	 * Setup socket listeners to track realtime updates
	 */
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

	/***
	 * 1️⃣ If a `roomId` is provided through URL parameter, update `selectedRoomId`.
 		  Else we'll update `selectedRoomId` when we click a chat.
	 */
	useEffect(() => {
		if (roomId) {
			setSelectedRoomId(roomId);
		}
	}, [roomId]);

	// If non-admin tries to access, show error UI
	if (user.role !== "admin") {
		return (
			<div className="h-[300px] flex items-center justify-center text-sm md:text-xl font-bold font-atma">
				You are not authorized to view this page.
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center text-3xl font-atma">
				Loading...
			</div>
		);
	}

	return (
		<div className="flex h-[550px] w-full max-w-6xl mx-auto border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xl font-atma">
			{/* LEFT SIDEBAR */}
			<div className="w-2/6 border-r border-gray-300 bg-gray-50 flex flex-col">
				{/* Header */}
				<div className="bg-gray-200 p-4 font-bold border-b border-gray-300 text-sm md:text-lg">
					Chats ({chatRooms.length})
				</div>

				{/* Chats list */}
				<div className="flex-1 overflow-y-auto">
					{chatRooms.length === 0 && (
						<div className="p-6 text-center text-gray-500">
							No active chats
						</div>
					)}

					{chatRooms.length > 0 &&
						chatRooms.map((room) => {
							// compute online/offline status.
							const isOnline = onlineUserIds.includes(room._id);

							return (
								<div
									key={room._id}
									onClick={(e) => {
										//2️⃣ If a chat is clicked from the list, update `selectedRoomId`,
										// else we'll update when we get a `roomId` through URL parameter
										e.stopPropagation();
										setSelectedRoomId(room._id);
									}}
									className={`p-4 border-b cursor-pointer transition ${
										selectedRoomId === room._id
											? "bg-[#ebebeb]"
											: "hover:bg-gray-100"
									}
								grid grid-cols-[1fr_8fr_3fr] mb-1`}
								>
									<div className="flex justify-start pt-1">
										{isOnline ? (
											<span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-800"></span>
										) : (
											<span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-700"></span>
										)}
									</div>

									<div className="flex flex-col">
										<h4 className="font-semibold text-gray-800 truncate text-xs md:text-sm flex-nowrap break-words">
											Client: {room.roomName}{" "}
										</h4>

										<p className="text-xs text-gray-600 truncate">
											{room.lastSenderRole === "admin"
												? "You: "
												: ""}{" "}
											{room.latestMessage}
										</p>
									</div>

									<div className="flex justify-end">
										<span className="text-xs text-gray-500">
											{formatTime(room.lastUpdatedAt)}
										</span>
									</div>
								</div>
							);
						})}
				</div>
			</div>

			{/* RIGHT CHATBOX */}
			<div className="w-4/6 bg-[#e5ddd5] flex items-center justify-center">
				{selectedRoomId ? (
					<div className="w-full h-full flex flex-col">
						<ChatBox selectedRoomId={selectedRoomId} />
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
