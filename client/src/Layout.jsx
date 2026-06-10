import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

const Layout = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div className="pt-28 flex-grow">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};

export default Layout;
