import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

const Layout = () => {
	return (
		<div>
			<Navbar />
			<div className="pt-32">
				<Outlet />
			</div>
		</div>
	);
};

export default Layout;
