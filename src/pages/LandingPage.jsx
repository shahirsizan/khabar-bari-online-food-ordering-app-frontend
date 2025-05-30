import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Hero2 from "../components/Hero/Hero2";
import Services from "../components/Services/Services";
import RecipeList from "../components/RecipeList/RecipeList";
import AppStore from "../components/AppStore/AppStore";
import Footer from "../components/Footer/Footer";

const LandingPage = () => {
	return (
		<div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
			<Navbar />
			<Hero2 />
			<Services />
			<RecipeList />
			<AppStore />
			<Footer />
		</div>
	);
};

export default LandingPage;
