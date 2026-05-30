import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useUserContext } from "./UserContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ProtectedLayout from "./ProtectedLayout";
import GuestRoute from "./GuestRoute.jsx";

const App = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useUserContext();

	// smooth intro
	useEffect(() => {
		AOS.init({
			offset: 100,
			duration: 500,
			easing: "ease-in-sine",
			delay: 100,
		});
		AOS.refresh();
	}, []);

	return (
		<div className=" ">
			<Routes>
				{/* Guest Only Routes */}
				<Route
					path="/login"
					element={
						<GuestRoute>
							<LoginPage />
						</GuestRoute>
					}
				/>
				<Route
					path="/register"
					element={
						<GuestRoute>
							<RegisterPage />
						</GuestRoute>
					}
				/>

				{/* Protected Routes (Wrapped in Layout) */}
				<Route element={<ProtectedLayout />}>
					<Route path="/" element={<LandingPage />} />
					<Route path="/cart" element={<CartPage />} />
					<Route path="/success/*" element={<SuccessPage />} />
					<Route path="/error" element={<ErrorPage />} />
				</Route>
			</Routes>
		</div>
	);
};

export default App;
