import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Error from "../components/Error/Error";
import Error2 from "../components/Error/Error2";

const ErrorPage = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<section className="flex-grow">
				{" "}
				{/* <Error /> */}
				<Error2 />
			</section>
		</div>
	);
};

export default ErrorPage;
