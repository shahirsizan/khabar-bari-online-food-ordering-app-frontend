import React from "react";
import Navbar from "../components/Navbar/Navbar";
import Cart from "../components/Cart/Cart";
import Footer from "../components/Footer/Footer";

const CartPage = () => {
	return (
		<div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
			<Navbar />
			<Cart />
			<Footer />
		</div>
	);
};

export default CartPage;
