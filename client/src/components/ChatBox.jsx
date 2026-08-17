import { useState, useEffect, useRef } from "react";
import { backend_base_url } from "../workMode";
import { apiFetch } from "../utils/api";
import { useUserContext } from "../UserContext";
import { formatTime } from "../utils/formatTime";

export const ChatBox = ({
	selectedRoomId,
	isChatBoxOpen,
	setIsChatBoxOpen,
}) => {
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const messagesEndRef = useRef(null);
	const chatContainerRef = useRef(null);
	const { isAdmin, user, socket, isAdminOnline } = useUserContext();
	const [roomId, setRoomId] = useState(null);
	const [roomName, setRoomName] = useState(null);
	const currentSenderId = user?._id;
	const currentSenderRole = isAdmin ? "admin" : "user";

	// console.log("selectedRoomId: ", selectedRoomId);
	// console.log("isChatBoxOpen: ", isChatBoxOpen);
	// console.log("setIsChatBoxOpen: ", setIsChatBoxOpen);

	/***
	 * (non-admin users) Attach event listener for outside click
	 */
	useEffect(() => {
		if (!isChatBoxOpen || !setIsChatBoxOpen) {
			return;
		}

		const handleClickOutside = (e) => {
			/***
			 * If:
				1. `click` was outside the chatbox
				2. `setIsChatBoxOpen` prop was provided from parent
				3. `chatContainerRef` exists,
				=> call setIsChatBoxOpen(false)
			 */

			if (
				chatContainerRef.current &&
				!chatContainerRef.current.contains(e.target) &&
				isChatBoxOpen &&
				setIsChatBoxOpen
			) {
				setIsChatBoxOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	/***
	 * For non-admin users, set roomId directly from his/her user object
	   For admin, set roomId from props
	 */
	useEffect(() => {
		const getRoomIdAndName = async () => {
			if (user.role !== "admin") {
				/***
				 * currently non-admin
				 */
				setRoomId(user._id.toString());
				setRoomName(user.name);
			} else {
				/***
				 * currently admin
				 */
				setRoomId(selectedRoomId);
				try {
					const response = await apiFetch(
						`${backend_base_url}/api/chatName/${selectedRoomId}`,
						{
							headers: {
								token: JSON.parse(
									localStorage.getItem("token"),
								),
							},
						},
					);

					if (response.ok) {
						const fetchedRoomName = await response.json();
						setRoomName(fetchedRoomName);
					}
				} catch (err) {
					console.error(
						"Error fetching room name for admin: ",
						err.message,
					);
				}
			}
		};

		if (isChatBoxOpen || selectedRoomId) {
			getRoomIdAndName();
		}
	}, [selectedRoomId, isChatBoxOpen]);

	// console.log("room id and name: ", roomId, " ", roomName);

	/***
	 * Setup socket on mount
	 */
	useEffect(() => {
		if (!socket || !roomId) {
			return;
		}

		// A `non-admin` user triggers `join_room` instantly through userContext while entering the app.
		// An `admin` has to select a specific room from AdminChatPanel to trigger `join_room`
		if (user.role === "admin") {
			socket.emit("join_room", { roomId: roomId });
		}

		// All messages are already stored in database and fetched upon mount.
		// Just append `newMessage` to current list sent from the `receive_message` event
		socket.on("receive_message", (newMessage) => {
			setMessages((prev) => {
				return [...prev, newMessage];
			});
		});

		/***
		 * A useEffect cleanup function runs when the component unmounts OR
		 * before the effect re-runs due to dependency changes.
		 * It does not execute just because the code inside the effect finishes running.
		 */
		return () => {
			// remove message listener
			socket.off("receive_message");

			// leave this room when admin switches chat in sidebar
			if (user.role === "admin") {
				socket.emit("leave_room", { roomId: roomId });
			}
		};
	}, [roomId, socket]);

	/***
	 * Load chat history on mount
	 */
	useEffect(() => {
		if (!roomId) {
			return;
		}

		const loadChatHistory = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/chat/${roomId}`,
					{
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					/***
					 * res.status(200).json({
							roomId: roomId,
							messages: messages,
						});
				 	*/
					const res = await response.json();
					// console.log("res: ", res);
					setMessages(res.messages);
				}
			} catch (err) {
				console.error("Error loading chat history: ", err.message);
			}
		};

		if (roomId) {
			loadChatHistory();
		}
	}, [roomId]);

	/***
	 * Auto-scroll to bottom upon mount OR when messages update
	 */
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	/***
	 * Send Message Action
	 */
	const handleSendMessage = (e) => {
		// console.log(
		// 	"room id, name and role: ",
		// 	roomId,
		// 	" ",
		// 	roomName,
		// 	" ",
		// 	user.role,
		// );

		e.preventDefault();

		// if empty message
		if (!inputMessage.trim()) {
			return;
		}

		const messageData = {
			roomId: roomId,
			roomName: roomName,
			senderId: currentSenderId,
			senderRole: currentSenderRole,
			text: inputMessage,
		};

		// console.log("messageData: ", messageData);
		socket.emit("send_message", messageData);
		setInputMessage("");
	};

	return (
		<div
			ref={chatContainerRef}
			className={`flex flex-col  ${isAdmin ? "h-full" : "max-h-[400px]"} w-full border border-gray-300 rounded-md shadow-lg overflow-hidden bg-[#e5ddd5] font-atma`}
		>
			{/* Chat Header */}
			<div className="bg-[#075e54] text-white text-xs md:text-sm p-2 font-semibold flex items-center justify-between">
				<span>{isAdmin ? `${roomName}` : "এডমিন"}</span>
				{isAdminOnline ? (
					<span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-green-500 shadow-lg"></span>
				) : (
					<span className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-red-700 shadow-lg"></span>
				)}
			</div>

			{/* chat body */}
			<div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs md:text-sm">
				{messages?.map((msg) => {
					const isMe = msg.senderId === currentSenderId;

					return (
						<div
							key={msg._id}
							className={`flex ${isMe ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[75%] px-3 py-2 rounded-lg shadow relative text-gray-900 ${
									isMe
										? "bg-[#dcf8c6] rounded-tr-none"
										: "bg-white rounded-tl-none"
								}`}
							>
								<p className="pr-12 break-words">{msg.text}</p>

								<span className="absolute bottom-1 right-1 text-[8px] md:text-[10px] text-gray-500 whitespace-nowrap">
									{formatTime(msg.createdAt)}
								</span>
							</div>
						</div>
					);
				})}

				<div ref={messagesEndRef} />
			</div>

			{/* Input Form */}
			<form
				onSubmit={(e) => {
					handleSendMessage(e);
				}}
				className="w-full bg-[#f0f0f0] px-3 py-2 gap-2 items-center grid grid-cols-[3fr_1fr]"
			>
				<input
					type="text"
					placeholder="Type message..."
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					className=" p-2 rounded-full border border-gray-300 focus:outline-none text-xs md:text-sm"
				/>

				<button
					type="submit"
					className=" text-white px-3 py-2 rounded-full font-semibold !bg-[#075e54] text-xs md:text-sm"
				>
					Send
				</button>
			</form>
		</div>
	);
};
