import Navbar from "../components/Navbar/Navbar";
import Hero2 from "../components/Hero/Hero2";
import Services from "../components/Services/Services";
import RecipeList from "../components/RecipeList/RecipeList";
import AppStore from "../components/AppStore/AppStore";
import Footer from "../components/Footer/Footer";
import Hero from "../components/Hero/Hero";

const LandingPage = () => {
	return (
		<div className=" bg-gray-200/50 dark:bg-gray-900 dark:text-white duration-300">
			<Hero2 />
			<Services />
			<RecipeList />
			<AppStore />
			<Footer />
		</div>
	);
};

export default LandingPage;
