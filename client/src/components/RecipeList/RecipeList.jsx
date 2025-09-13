import React, { useEffect } from "react";
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

	const FoodData = [
		{
			id: 1,
			image: AchariChicken,
			price: 499,
			name: "আচারি চিকেন",
			desc: "আম এবং রসুনের আচার দিয়ে বানানো চিকেনের রেসিপি",
		},
		{
			id: 2,
			image: BeefBrainMasala,
			price: 599,
			name: "গরুর মগজ ভূনা",
			desc: "গরুর মগজ, পেঁয়াজ, রসুন, আদা ও বিভিন্ন মসলা সহযোগে ভুনা করা।",
		},
		{
			id: 3,
			image: chickenkarai,
			price: 499,
			name: "চিকেন কড়াই",
			desc: "টমেটোর ঘন ও মসলাদার ঝোলে রান্না করা মুরগির মাংস",
		},
		{
			id: 4,
			image: ChickenTikkaButterMasala,
			price: 480,
			name: "চিকেন টিক্কা বাটার মাসালা",
			desc: "রোস্ট করা মসলাযুক্ত তরকারির সাথে রান্না করা মুরগির মাংস",
		},
		{
			id: 5,
			image: rice,
			price: 30,
			name: "ভাত",
			desc: "সাদা ভাত",
		},
		{
			id: 6,
			image: ShahiMorogPolao,
			price: 153,
			name: "শাহী মোরগ পোলাও",
			desc: "মোরগ পোলাও. ডিম ও কাবাব সহযোগে পরিবেশিত। অন্যান্য নাম, শাহী মোরগ পোলাও, ঢাকাইয়া মোরগ পোলাও",
		},
		{
			id: 7,
			image: EggKhichuri,
			price: 85,
			name: "ডিম খিচুড়ি",
			desc: "ডিম খিচুড়ি",
		},
		{
			id: 8,
			image: moogdal,
			price: 40,
			name: "মুগ ডাল",
			desc: "মুগ ডাল ও মশলা সহযোগে প্রস্তুতকৃত, প্রোটিন সমৃদ্ধ",
		},
		{
			id: 9,
			image: mixedvegetable,
			price: 40,
			name: "মিক্সড সবজি",
			desc: "আলু, লাউ, মিষ্টিকুমড়াসহ কয়েক পদের সবজি সহযোগে প্রস্তুতকৃত",
		},
	];

	// `cartItems` e already item ta thakle count return koro. Nahole return 0.
	const getQuantity = (id) => {
		return cartItems.find((item) => item.id === id)?.quantity || 0;
	};

	// scroll to selected-id section
	const location = useLocation();
	useEffect(() => {
		// if there's a hash in the URL
		if (location.hash) {
			const id = location.hash.replace("#", "");
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		}
	}, []);

	return (
		<section
			className="recipeSection font-atma py-8 lg:py-12 px-[5vw] md:px-[8vw] lg:px-[10vw]"
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
				{FoodData.map((item, index) => {
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
					// item = {
					// 	image: AchariChicken,
					// 	price: 499,
					// 	name: "Achari Chicken",
					// 	desc: "Blend of pickling spices mixed with tender chicken pcs creating a thick & delicious gravy",
					// }
					return (
						<div
							key={index}
							// nicher dark/bright class gula rakhte hobe. Do not remove
							className="flex flex-col font-atma bg-gradient-to-r from-primary to-secondary text-white p-2 xl:p-4 rounded-2xl shadow-xl"
						>
							{/* IMAGE CONTAINER */}
							<div className="w-full h-32 md:h-40 overflow-hidden flex justify-center items-center rounded-2xl shadow-lg">
								<img
									src={item.image}
									className="object-cover"
								/>
							</div>

							{/* name & desc */}
							<div className="py-2 xl:py-3">
								<p className="font-bold text-2xl lg:text-4xl text-center drop-shadow-[1px_1px_0px_black]">
									{item.name}
								</p>
							</div>

							<div className="flex-grow"></div>

							{/* price and counts */}
							<div className="">
								{/* price */}
								<div>
									<p className="font-semibold text-xl lg:text-3xl text-center drop-shadow-[1px_1px_0px_black]">
										৳ {toBanglaNumber(item.price)}
									</p>
								</div>

								<div>
									{quantity > 0 ? (
										<div className="mt-5 flex items-center gap-2 justify-center">
											{/* Already selected */}

											{/* Minus button */}
											<button
												className="transition-all hover:scale-110"
												onClick={() => {
													quantity > 1
														? updateQuantity(
																item.id,
																quantity - 1
														  )
														: removeFromCart(
																item.id
														  );
												}}
											>
												<svg
													stroke="currentColor"
													fill="currentColor"
													viewBox="0 0 448 512"
													className=" text-orange-500 dark:text-orange-500 bg-white border-4 border-orange-500 w-7 h-7 rounded-full drop-shadow-[1px_1px_0px_black]"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
												</svg>
											</button>

											{/* quantity */}
											<span className="w-8 text-center font-semibold text-2xl drop-shadow-[1px_1px_0px_black]">
												{toBanglaNumber(quantity)}
											</span>

											{/* Plus button */}
											<button
												className="transition-all hover:scale-110"
												onClick={() => {
													updateQuantity(
														item.id,
														quantity + 1
													);
												}}
											>
												<svg
													stroke="currentColor"
													fill="currentColor"
													viewBox="0 0 448 512"
													className="text-orange-500 dark:text-orange-500 bg-white border-4 border-orange-500 w-7 h-7 rounded-full drop-shadow-[1px_1px_0px_black]"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
												</svg>
											</button>
										</div>
									) : (
										<div className="flex justify-center gap-2">
											{/* Not selected */}
											<button
												onClick={() => {
													addToCart(item, 1);
													// DEFINITION
													// const addToCart = useCallback((item, quantity) => {
													// 		dispatch({ type: "ADD_ITEM", payload: { item, quantity } });
													// 	}, []);
												}}
												className="my-2 py-1 px-4 rounded-full bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold drop-shadow-[1px_1px_2px_black] transition-all hover:scale-110"
											>
												<span className="relative z-10 drop-shadow-[1px_1px_2px_gray]">
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
