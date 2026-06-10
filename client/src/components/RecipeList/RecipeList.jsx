import React, { useEffect, useState } from "react";
import AchariChicken from "../../assets/AchariChicken.png";
import BeefBrainMasala from "../../assets/BeefBrainMasala.png";
import chickenkarai from "../../assets/chickenkarai.png";
import ChickenTikkaButterMasala from "../../assets/ChickenTikkaButterMasala.png";
import ShahiMorogPolao from "../../assets/ShahiMorogPolao.png";
import rice from "../../assets/rice.png";
import EggKhichuri from "../../assets/EggKhichuri.png";
import mixedvegetable from "../../assets/mixedvegetable.jpg";
import moogdal from "../../assets/moogdal.png";

import { useCart } from "../../CartContext";
import { useLocation } from "react-router-dom";

const RecipeList = () => {
	const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
	const [menuItems, setMenuItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchMenuItems = async () => {
			try {
				const response = await fetch(
					"http://localhost:5000/api/menu-items",
					{
						method: "GET",
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const data = await response.json();

					// Map the DB documents to match the UI's expected structure
					const normalizedItems = data.map((item) => ({
						id: item._id,
						name: item.name,
						price: item.basePrice,
						desc: item.description,
						image: item.image,
					}));

					console.log(normalizedItems);

					setMenuItems(normalizedItems);
				} else {
					throw new Error("Error in fetchMenuItems");
				}
			} catch (error) {
			} finally {
				setIsLoading(false);
			}
		};

		fetchMenuItems();
	}, []);

	// `cartItems` e already item ta thakle count return koro. Nahole return 0.
	const getQuantity = (id) => {
		return cartItems.find((item) => item.id === id)?.quantity || 0;
	};

	// scroll to selected-id section
	const location = useLocation();
	useEffect(() => {
		if (location.hash) {
			const targetId = location.hash.substring(1);

			// 1. Add a slight delay (100ms) to allow the DOM/Images to settle
			const timer = setTimeout(() => {
				const element = document.getElementById(targetId);
				if (element) {
					element.scrollIntoView({ behavior: "smooth" });
				}
			}, 200);

			// Cleanup timeout if user navigates away quickly
			return () => clearTimeout(timer);
		}
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center text-3xl">
				Loading...
			</div>
		);
	}

	return (
		<section
			className="recipeList scroll-mt-32 font-atma py-8 lg:py-12 px-[5vw] md:px-[8vw] lg:px-[10vw]"
			id="recipeList"
		>
			{/* header text */}
			<div className="text-center mb-14 mx-auto">
				<p className="py-4 text-5xl xl:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_0px_black]">
					আমাদের রেসিপিসমূহ{" "}
				</p>
			</div>

			{/* CARDS */}
			<div className="grid grid-cols-fluid-grid gap-3 xl:gap-4">
				{menuItems.map((item, index) => {
					const quantity = getQuantity(item.id);
					const toBanglaNumber = (number) => {
						const banglaDigits = [
							"০",
							"১",
							"২",
							"৩",
							"৪",
							"৫",
							"৬",
							"৭",
							"৮",
							"৯",
						];
						return number
							.toString()
							.split("")
							.map((d) => banglaDigits[parseInt(d)])
							.join("");
					};

					/***
					 * items:
					 * [
					 * 		{
								"id": "6a217440d6b3653f8f161e1e",
								"name": "চিকেন বিরিয়ানি",
								"price": 200,
								"desc": "চিকেন বিরিয়ানি রেসিপি",
								"image": "https://recipe30.com/wp-content/uploads/2023/03/chicken-Biryani.jpg"
							}.
							{},
							{},
						]
}
					 * 
					 */
					return (
						<div
							key={index}
							// nicher dark/bright class gula rakhte hobe. Do not remove
							className="flex flex-col font-atma bg-gradient-to-r from-primary to-secondary text-white p-2 xl:p-4 rounded-2xl shadow-xl group hover:scale-105 transition-all duration-700"
						>
							{/* IMAGE CONTAINER */}
							<div className="w-full h-32 md:h-40 overflow-hidden flex justify-center items-center rounded-2xl shadow-lg">
								<img
									src={item.image}
									className="object-cover group-hover:scale-110 transition-all duration-1000"
								/>
							</div>

							{/* name & desc */}
							<div className="py-2 xl:py-3">
								<p className="font-bold text-lg lg:text-2xl text-center drop-shadow-[2px_1px_2px_black]">
									{item.name}
								</p>
							</div>

							<div className="flex-grow"></div>

							{/* price and counts */}
							<div className="">
								{/* price */}
								<div>
									<p className="font-semibold text-md lg:text-3xl text-center drop-shadow-[2px_1px_2px_black]">
										৳ {toBanglaNumber(item.price)}
									</p>
								</div>

								<div>
									{quantity > 0 ? (
										<div className="WHEN-SELECTED mt-5 md:mt-10 flex items-center gap-2 justify-center">
											{/* Minus button */}
											<button
												className="border-none"
												onClick={() => {
													quantity > 1
														? updateQuantity(
																item.id,
																quantity - 1,
															)
														: removeFromCart(
																item.id,
															);
												}}
											>
												<svg
													stroke="currentColor"
													fill="currentColor"
													viewBox="0 0 448 512"
													className=" text-orange-500 dark:text-orange-500 bg-white border-4 border-orange-500 w-5 h-5 md:w-7 md:h-7 rounded-full drop-shadow-[1px_1px_0px_black]"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
												</svg>
											</button>

											{/* quantity */}
											<span className="w-8 text-center font-semibold text-2xl drop-shadow-[2px_1px_2px_black]">
												{toBanglaNumber(quantity)}
											</span>

											{/* Plus button */}
											<button
												className="border-none"
												onClick={() => {
													updateQuantity(
														item.id,
														quantity + 1,
													);
												}}
											>
												<svg
													stroke="currentColor"
													fill="currentColor"
													viewBox="0 0 448 512"
													className="text-orange-500 dark:text-orange-500 bg-white border-4 border-orange-500 w-5 h-5 md:w-7 md:h-7 rounded-full drop-shadow-[1px_1px_0px_black]"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
												</svg>
											</button>
										</div>
									) : (
										<div className="WHEN-NOT-SELECTED mt-5 md:mt-10 flex justify-center gap-2">
											<button
												onClick={() => {
													addToCart(item, 1);
													// DEFINITION
													// const addToCart = useCallback((item, quantity) => {
													// 		dispatch({ type: "ADD_ITEM", payload: { item, quantity } });
													// 	}, []);
												}}
												className="py-1 px-2 rounded-full bg-gradient-to-r from-primary to-secondary drop-shadow-[2px_1px_2px_black]"
											>
												<span className=" text-sm md:text-md xl:text-lg text-center">
													অর্ডার করুন
												</span>
											</button>
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default RecipeList;
