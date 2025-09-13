import Navbar from "../components/Navbar/Navbar";
import Hero2 from "../components/Hero/Hero2";
import Services from "../components/Services/Services";
import RecipeList from "../components/RecipeList/RecipeList";
import AppStore from "../components/AppStore/AppStore";
import Footer from "../components/Footer/Footer";

const LandingPage = () => {
	return (
		<div>
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
