import { useState, useEffect, useRef } from "react";
import { backend_base_url } from "../workMode";
import { apiFetch } from "../utils/api";
import { useUserContext } from "../UserContext";
import { formatTime } from "../utils/formatTime";

export const ChatBox = ({
	chatRoomIdFromAdminPanel,
	chatRoomNameFromAdminPanel,
	isOpen,
	setIsOpen,
}) => {
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const messagesEndRef = useRef(null);
	const chatContainerRef = useRef(null);
	const { isAdmin, user, socket, isAdminOnline } = useUserContext();
	const [chatRoomId, setChatRoomId] = useState(null);
	const [chatRoomName, setChatRoomName] = useState(null);
	const currentSenderId = user?._id;
	const currentSenderRole = isAdmin ? "admin" : "user";

	useEffect(() => {
		const handleClickOutside = (e) => {
			// If:
			// 1. `click` was outside the chatbox
			// 2. `setIsOpen` prop was provided from parent
			// 3. `chatContainerRef` exists,
			// => call setIsOpen(false)

			if (
				chatContainerRef.current &&
				!chatContainerRef.current.contains(e.target) &&
				isOpen &&
				setIsOpen
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	// if non-admin, set roomId and roomName directly from users object.
	// if admin, set roomId and roomName from props coming from parent AdminChatPanel.jsx
	useEffect(() => {
		if (user.role !== "admin") {
			setChatRoomId(user._id);
			setChatRoomName(user.name);
			// console.log("chatRoomId: ", user._id);
		} else {
			setChatRoomId(chatRoomIdFromAdminPanel);
			setChatRoomName(chatRoomNameFromAdminPanel);
			// console.log("chatRoomId: ", chatRoomIdFromAdminPanel);
		}
	}, [chatRoomIdFromAdminPanel, user]);

	// setup socket and chat history on mount
	useEffect(() => {
		if (!socket || !chatRoomId) {
			return;
		}

		// A `non-admin` user triggers `join_room` instantly through userContext while entering the app.
		// But an `admin` has to select a specific room from sidebar to trigger `join_room`
		if (user.role === "admin") {
			socket.emit("join_room", { roomId: chatRoomId });
		}

		const loadChatHistory = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/chat/${chatRoomId}`,
					{
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const res = await response.json();
					setMessages(res);
				}
			} catch (err) {
				console.error("Error loading chat history: ", err.message);
			}
		};

		loadChatHistory();

		// All messages are already stored in database and fetched upon mount.
		// Just append `newMessage` to current list sent from the `receive_message` event
		socket.on("receive_message", (newMessage) => {
			setMessages((prev) => {
				// Prevent duplicate messages if backend echoes back to sender several times
				// if (prev.some((msg) => msg._id === newMessage._id)) {
				// 	return prev;
				// }
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
				socket.emit("leave_room", { roomId: chatRoomId });
			}
		};
	}, [chatRoomId, chatRoomIdFromAdminPanel, socket]);

	// auto-scroll to bottom upon mount or when messages update
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// 3. Send Message Action
	const handleSendMessage = (e) => {
		e.preventDefault();

		// if empty message
		if (!inputMessage.trim()) {
			return;
		}

		const messageData = {
			roomId: chatRoomId,
			roomName: chatRoomName,
			senderId: currentSenderId,
			senderRole: currentSenderRole,
			text: inputMessage,
		};

		socket.emit("send_message", messageData);
		setInputMessage("");
	};

	return (
		<div
			ref={chatContainerRef}
			className="flex flex-col h-[500px] w-full border border-gray-300 rounded-lg shadow-lg overflow-hidden bg-[#e5ddd5] font-atma"
		>
			{/* Chat Header */}
			<div className="bg-[#075e54] text-white text-xs md:text-sm p-2 font-semibold flex items-center justify-between">
				<span>{isAdmin ? `${chatRoomName}` : "এডমিন"}</span>
				{isAdminOnline ? (
					<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
				) : (
					<span className="h-2 w-2 rounded-full bg-red-700 animate-pulse"></span>
				)}
			</div>

			{/* Show messages area */}
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

			{/* Message Input Form */}
			<form
				onSubmit={(e) => {
					handleSendMessage(e);
				}}
				className="w-full bg-[#f0f0f0] p-3 gap-2 items-center grid grid-cols-[3fr_1fr]"
			>
				<input
					type="text"
					placeholder="Type message..."
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					className=" p-2 rounded-full border border-gray-300 focus:outline-none text-sm"
				/>

				<button
					type="submit"
					className=" text-white px-3 py-2 rounded-full text-xs font-semibold !bg-[#075e54]"
				>
					Send
				</button>
			</form>
		</div>
	);
};
