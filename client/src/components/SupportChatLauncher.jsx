import { useState } from "react";
import { ChatBox } from "./ChatBox";
import { BiSupport } from "react-icons/bi";
import { useEffect } from "react";
import { useUserContext } from "../UserContext";

export const SupportChatLauncher = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { user } = useUserContext();

	return (
		<div className="fixed md:bottom-14 md:right-3 bottom-5 w-full md:w-1/3 z-50 flex flex-col items-end">
			{/* Chatbox Container */}
			{isOpen && (
				<div className="w-full mb-4">
					<ChatBox isOpen={isOpen} setIsOpen={setIsOpen} />
				</div>
			)}

			{/* open/close Button */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen((prev) => {
						return isOpen ? false : true;
					});
				}}
				className={`w-full flex items-center gap-2 px-2 py-3 rounded-full text-white shadow-xl font-atma ${
					isOpen
						? "bg-red-500 hover:bg-red-600"
						: "bg-[#075e54] hover:bg-[#128c7e] hover:shadow-xl"
				}`}
			>
				<BiSupport className="w-6 h-6" />
				<span className="text-[12px] md:text-md">
					{isOpen ? "বন্ধ করুন" : "যোগাযোগ করুন"}
				</span>
			</button>
		</div>
	);
};
