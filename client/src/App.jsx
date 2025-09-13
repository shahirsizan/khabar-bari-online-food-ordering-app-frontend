import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

const App = () => {
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
		<div className=" bg-gray-200/50 dark:bg-gray-900 dark:text-white duration-300">
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/cart" element={<CartPage />} />
				<Route path="/success/*" element={<SuccessPage />} />
				<Route path="/error" element={<ErrorPage />} />
			</Routes>
		</div>
	);
};

export default App;
