import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Success from "../components/Success/Success";
import SuccessCOD from "../components/SuccessCOD/SuccessCOD";

const SuccessPage = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<section className="flex-grow">
				<Routes>
					<Route path="/" element={<Success />} />
					<Route path="cod" element={<SuccessCOD />} />
				</Routes>
			</section>
			<Footer className="mt-auto" />
		</div>
	);
};

export default SuccessPage;
