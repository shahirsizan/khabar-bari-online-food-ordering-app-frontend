import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Success from "../components/Success/Success";
import Success2 from "../components/Success/Success2";

const SuccessPage = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<section className="flex-grow">
				<Routes>
					{/* <Route path="/*" element={<Success />} /> */}
					<Route path="/*" element={<Success2 />} />
				</Routes>
			</section>
		</div>
	);
};

export default SuccessPage;
