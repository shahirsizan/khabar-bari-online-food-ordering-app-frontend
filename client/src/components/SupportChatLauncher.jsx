import { useState } from "react";
import { ChatBox } from "./ChatBox";
import { BiSupport } from "react-icons/bi";
import { useEffect } from "react";
import { useUserContext } from "../UserContext";

export const SupportChatLauncher = () => {
	const {
		user,
		blinkNonAdminUsersChatLauncher,
		setBlinkNonAdminUsersChatLauncher,
		isChatBoxOpen,
		setIsChatBoxOpen,
	} = useUserContext();

	// console.log(
	// 	"blinkNonAdminUsersChatLauncher: ",
	// 	blinkNonAdminUsersChatLauncher,
	// );

	// useEffect(() => {
	// 	if (isOpen) {
	// 		setBlinkNonAdminUsersChatLauncher(false);
	// 	}
	// }, [isOpen]);

	return (
		<div className="fixed md:bottom-14 md:right-3 bottom-5 w-full md:w-1/3 z-50 flex flex-col items-end">
			{/* Chatbox Container */}
			{isChatBoxOpen && (
				<div className="w-full mb-4">
					<ChatBox
						isChatBoxOpen={isChatBoxOpen}
						setIsChatBoxOpen={setIsChatBoxOpen}
					/>
				</div>
			)}

			{/* open/close Button */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsChatBoxOpen((prev) => {
						return isChatBoxOpen ? false : true;
					});
					setBlinkNonAdminUsersChatLauncher(false);
				}}
				className={`w-full flex items-center gap-2 px-2 py-3 rounded-full text-white shadow-xl font-atma ${
					isChatBoxOpen
						? "bg-red-500 hover:bg-red-600"
						: "bg-[#075e54] hover:bg-[#128c7e] hover:shadow-xl"
				}`}
			>
				<BiSupport className="w-6 h-6" />
				<span className="text-[12px] md:text-md">
					{isChatBoxOpen ? "বন্ধ করুন" : "যোগাযোগ করুন"}
				</span>
			</button>

			{!isChatBoxOpen && (
				<div
					className={`absolute flex z-50 -top-2 right-0 animate-bounce ${blinkNonAdminUsersChatLauncher ? "opacity-100" : "opacity-0"}`}
				>
					<span className="h-2 w-2 md:h-5 md:w-5 rounded-full bg-red-700"></span>
				</div>
			)}
		</div>
	);
};
