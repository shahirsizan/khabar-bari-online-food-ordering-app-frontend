import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Error from "../components/Error/Error";

const ErrorPage = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<section className="flex-grow">
				{" "}
				<Error />
			</section>

			<Footer />
		</div>
	);
};

export default ErrorPage;
