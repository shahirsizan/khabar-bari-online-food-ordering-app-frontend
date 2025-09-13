import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Success from "../components/Success/Success";

const SuccessPage = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<section className="flex-grow">
				<Routes>
					<Route path="/" element={<Success />} />
				</Routes>
			</section>
			<Footer className="mt-auto" />
		</div>
	);
};

export default SuccessPage;
