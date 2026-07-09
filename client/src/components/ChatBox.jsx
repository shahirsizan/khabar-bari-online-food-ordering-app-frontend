import { useState, useEffect, useRef } from "react";
import { backend_base_url } from "../workMode";
import { apiFetch } from "../utils/api";
import { useUserContext } from "../UserContext";

export const ChatBox = ({ chatRoomId }) => {
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const messagesEndRef = useRef(null);
	const { isAdmin, user, socket } = useUserContext();

	const currentSenderId = user?._id;
	const currentSenderRole = isAdmin ? "admin" : "user";

	const formatTime = (isoString) => {
		return new Date(isoString).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// 1. setup socket and chat history on mount
	useEffect(() => {
		if (!chatRoomId) {
			return;
		}

		socket.emit("join_room", chatRoomId);

		// add event listen for new messages
		// latest message is already stored in databse through socket
		// just append it into current list
		socket.on("receive_message", (newMessage) => {
			setMessages((prev) => {
				// Prevent duplicate messages if backend echoes back to sender several times
				if (prev.some((msg) => msg._id === newMessage._id)) {
					return prev;
				}
				return [...prev, newMessage];
			});
		});

		const loadChatHistory = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/chat/${chatRoomId}`,
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

		// remove event listener on unmount
		return () => {
			socket.off("receive_message");
		};
	}, [chatRoomId]);

	// auto-scroll to bottom
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
			senderId: currentSenderId,
			senderRole: currentSenderRole,
			text: inputMessage,
		};

		socket.emit("send_message", messageData);
		setInputMessage("");
	};

	return (
		<div className="flex flex-col h-[500px] w-full border border-gray-300 rounded-lg shadow-lg overflow-hidden bg-[#e5ddd5]">
			{/* Chat Header */}
			<div className="bg-[#075e54] text-white p-4 font-bold flex items-center justify-between">
				<span>{isAdmin ? "Customer Support" : "Chat With Admin"}</span>
				<span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
			</div>

			{/* Show messages area */}
			<div className="flex-1 overflow-y-auto p-4 space-y-3">
				{messages?.map((msg) => {
					const isMe = msg.senderId === currentSenderId;

					return (
						<div
							key={msg._id}
							className={`flex ${isMe ? "justify-end" : "justify-start"}`}
						>
							<div
								className={`max-w-[75%] px-3 py-2 rounded-lg shadow relative text-sm text-gray-900 ${
									isMe
										? "bg-[#dcf8c6] rounded-tr-none"
										: "bg-white rounded-tl-none"
								}`}
							>
								<p className="pr-12 break-words">{msg.text}</p>

								<span className="absolute bottom-1 right-2 text-[10px] text-gray-500 whitespace-nowrap">
									{formatTime(msg.createdAt)}
								</span>
							</div>
						</div>
					);
				})}

				<div ref={messagesEndRef} />
			</div>

			{/* Message Input Box */}
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
