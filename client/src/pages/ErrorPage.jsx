import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Error from "../components/Error/Error";

const ErrorPage = () => {
	return (
		<div>
			<Navbar />
			<Error />
			<Footer />
		</div>
	);
};

export default ErrorPage;
