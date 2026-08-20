import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/Hero/Hero";
import Services from "../components/Services/Services";
import RecipeList from "../components/RecipeList/RecipeList";
import AppStore from "../components/AppStore/AppStore";

const LandingPage = () => {
	return (
		<div className=" bg-gray-200/50 dark:bg-gray-900 dark:text-white duration-300">
			<Hero />
			<Services />
			<RecipeList />
			<AppStore />
		</div>
	);
};

export default LandingPage;
