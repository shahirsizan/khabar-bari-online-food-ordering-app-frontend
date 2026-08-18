import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useUserContext } from "./UserContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ProtectedLayout from "./ProtectedLayout.jsx";
import GuestRoute from "./GuestRoute.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import Layout from "./Layout.jsx";
import ProfileLayout from "./ProfileLayout.jsx";
import MenuItemsPage from "./pages/MenuItemsPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import NewMenuItemPage from "./pages/NewMenuItemPage.jsx";
import EditMenuItemPage from "./pages/EditMenuItemPage.jsx";
import EditUserPage from "./pages/EditUserPage.jsx";
import OrderPage from "./pages/OrderPage.jsx";
import { GlobalRateLimitModal } from "./components/GlobalRateLimitModal.jsx";
import { AdminChatPanel } from "./pages/AdminChatPanel.jsx";
import { ResetPasswordAfterLink } from "./pages/ResetPasswordAfterLink.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";

const App = () => {
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

			{/* The modal needs to be placed where it can sit "on top" of your entire application.
			The Event Signal: When apiFetch detects a 429, it broadcasts a message through the window object.
			The Listener: Your GlobalRateLimitModal is "listening" to the window at all times. */}
			<GlobalRateLimitModal />
		</div>
	);
};

export default App;
