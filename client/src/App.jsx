import React from "react";
import Hero from "./components/Hero/Hero";
import Navbar from "./components/Navbar/Navbar";
import Services from "./components/Services/Services.jsx";
import AppStore from "./components/AppStore/AppStore.jsx";
import CoverBanner from "./components/CoverBanner/CoverBanner.jsx";
import Footer from "./components/Footer/Footer.jsx";
import AOS from "aos";
import "aos/dist/aos.css";
import Hero2 from "./components/Hero/Hero2.jsx";
import RecipeList from "./components/RecipeList/RecipeList.jsx";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import CartPage from "./pages/CartPage.jsx";

const App = () => {
	React.useEffect(() => {
		AOS.init({
			offset: 100,
			duration: 500,
			easing: "ease-in-sine",
			delay: 100,
		});
		AOS.refresh();
	}, []);

	return (
		<div className=" bg-white dark:bg-gray-900 dark:text-white duration-200">
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/cart" element={<CartPage />} />
			</Routes>

			{/* <Navbar />
			<Hero2 />

			<Services />
			<RecipeList />
			<AppStore />
			<Footer /> */}
		</div>
	);
};

export default App;
