import { useState } from "react";
import { ChatBox } from "./ChatBox";
import { BiSupport } from "react-icons/bi";
import { useEffect } from "react";

export const SupportChatLauncher = ({ chatRoomId }) => {
	const [isOpen, setIsOpen] = useState(false);

	if (!chatRoomId) {
		return null;
	}

	return (
		<div className="fixed bottom-14 right-3 w-full md:w-1/3 z-50 flex flex-col items-end font-sans">
			{/* Chat Window Container */}
			{isOpen && (
				<div className="w-full mb-4">
					<ChatBox chatRoomId={chatRoomId} />
				</div>
			)}

			{/* Chat open/close Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex items-center gap-2 px-3 py-2 text-xs md:text-md rounded-full text-white font-semibold shadow-xl ${
					isOpen
						? "bg-red-500 hover:bg-red-600"
						: "bg-[#075e54] hover:bg-[#128c7e] hover:shadow-2xl"
				}`}
			>
				<BiSupport className="w-5 h-5" />
				<span>{isOpen ? "Close" : "Support"}</span>
			</button>
		</div>
	);
};
