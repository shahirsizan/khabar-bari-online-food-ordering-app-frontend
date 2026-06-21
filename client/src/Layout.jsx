import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col bg-gray-200/50 dark:bg-gray-900 dark:text-white duration-300">
			<Navbar />
			<div className="pt-20 flex-grow ">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};

export default Layout;
