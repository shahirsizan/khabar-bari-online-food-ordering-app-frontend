import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Route, Routes } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import ErrorPage from "./pages/ErrorPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProtectedLayout from "./ProtectedLayout";
import GuestRoute from "./GuestRoute";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import Layout from "./Layout";
import ProfileLayout from "./ProfileLayout";
import MenuItemsPage from "./pages/MenuItemsPage";
import UsersPage from "./pages/UsersPage";
import NewMenuItemPage from "./pages/NewMenuItemPage";
import EditMenuItemPage from "./pages/EditMenuItemPage";
import EditUserPage from "./pages/EditUserPage";
import OrderPage from "./pages/OrderPage";
import { GlobalRateLimitModal } from "./components/GlobalRateLimitModal";
import { AdminChatPanel } from "./pages/AdminChatPanel";
import { ResetPasswordAfterLink } from "./pages/ResetPasswordAfterLink";
import ChangePassword from "./pages/ChangePassword";
import AuditLogsPage from "./pages/AuditLogsPage";

const App: React.FC<{}> = () => {
	// smooth intro
	useEffect(() => {
		AOS.init({
			offset: 100,
			duration: 200,
			easing: "ease-in-sine",
			// delay: 100,
		});
		AOS.refresh();
	}, []);

	return (
		<div className="APPCOMPONENT">
			<Routes>
				{/* Guest Only Routes */}
				<Route element={<GuestRoute />}>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route
						path="/reset-password-after-link"
						element={<ResetPasswordAfterLink />}
					/>
				</Route>

				<Route element={<Layout />}>
					<Route path="/" element={<LandingPage />} />
					<Route path="/cart" element={<CartPage />} />

					{/* Protected Routes (Wrapped in Layout) */}
					<Route element={<ProtectedLayout />}>
						<Route path="/profile" element={<ProfileLayout />}>
							<Route index element={<ProfilePage />} />
							<Route
								path="menu-items"
								element={<MenuItemsPage />}
							/>
							<Route path="users" element={<UsersPage />} />
							<Route path="orders" element={<OrdersPage />} />
							<Route
								path="chats/:roomId?"
								element={<AdminChatPanel />}
							/>
							<Route path="logs" element={<AuditLogsPage />} />
						</Route>

						<Route
							path="/profile/change-password"
							element={<ChangePassword />}
						/>
						<Route
							path="/menu-items/new"
							element={<NewMenuItemPage />}
						/>
						<Route
							path="/menu-items/edit/:id"
							element={<EditMenuItemPage />}
						/>
						<Route path="/users/:id" element={<EditUserPage />} />
						<Route path="/order/:id" element={<OrderPage />} />

						<Route path="/success/*" element={<SuccessPage />} />
						<Route path="/error" element={<ErrorPage />} />
					</Route>
				</Route>
			</Routes>

			{/* This modal needs to be placed where it can sit "on top" of our application.
			The Event Signal: When `apiFetch` detects a 429, it broadcasts a message through the window object.
			The Listener: Below modal is "listening" to the window at all times. */}
			<GlobalRateLimitModal />
		</div>
	);
};

export default App;
