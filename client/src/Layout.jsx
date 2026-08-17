import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { ChatBox } from "./components/ChatBox";
import { SupportChatLauncher } from "./components/SupportChatLauncher";
import { useUserContext } from "./UserContext";

import { backend_base_url } from "./workMode";
import { useState } from "react";
import { useEffect } from "react";
import { apiFetch } from "./utils/api";

const Layout = () => {
	const { user, isAdmin, isAuthenticated } = useUserContext();

	return (
		<div className="min-h-screen flex flex-col bg-gray-200/50 dark:bg-gray-900 dark:text-white duration-300">
			<Navbar />

			<div className="pt-10 pb-10 flex-grow ">
				<Outlet />
			</div>

			{/* chat button for non-admin auth'd users */}
			{isAuthenticated && !isAdmin && <SupportChatLauncher />}
			<Footer />
		</div>
	);
};

export default Layout;
