import React, { useEffect } from "react";
import AchariChicken from "../../assets/AchariChicken.png";
import BeefBrainMasala from "../../assets/BeefBrainMasala.png";
import chickenkarai from "../../assets/chickenkarai.png";
import ChickenTikkaButterMasala from "../../assets/ChickenTikkaButterMasala.png";
import ShahiMorogPolao from "../../assets/ShahiMorogPolao.png";
import rice from "../../assets/rice.png";
import EggKhichuri from "../../assets/EggKhichuri.png";
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
	];

	// `cartItems` e already item ta thakle count return koro. Nahole return 0.
	const getQuantity = (id) => {
		return cartItems.find((item) => item.id === id)?.quantity || 0;
	};

	const location = useLocation();
	useEffect(() => {
		// Check if there's a hash in the URL
		if (location.hash) {
			const id = location.hash.replace("#", "");
			const element = document.getElementById(id);
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		}
	}, []);

	return (
		<div className="container py-16" id="recipeList">
			{/* header text */}
			<div className="text-center mb-14  mx-auto">
				<p className="py-4 text-5xl md:text-7xl font-atma font-bold bg-clip-text text-transparent drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary ">
					আমাদের রেসিপিগুলো
				</p>
			</div>

			{/* card section */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
							className="bg-white dark:bg-gray-800 dark:text-white p-5 lg:p-6 rounded-3xl shadow-2xl flex flex-col font-atma"
						>
							{/* image */}
							<div className="flex justify-center ">
								<img
									src={item.image}
									// className="w-60 sm:w-40 lg:w-[240px] mx-auto object-contain "
									className="h-[160px] w-[160px] aspect-square rounded-md overflow-hidden drop-shadow-[0_1px_1px_black]"
								/>
							</div>

							{/* name & desc */}
							<div className="py-5 space-y-2">
								<p className="font-semibold text-gray-800 dark:text-white text-3xl text-center drop-shadow-[0_1px_0_black]">
									{item.name}
								</p>
								{/* <p className="text-xl ">{item.desc}</p> */}
							</div>

							{/* price */}
							<div className="mt-auto">
								<p className="dark:text-white font-bold text-2xl text-center">
									৳ {toBanglaNumber(item.price)}
								</p>
							</div>

							<div>
								{quantity > 0 ? (
									<div className="mt-5 flex items-center gap-2 justify-center">
										{/* Already selected */}

										{/* Minus button */}
										<button
											onClick={() => {
												quantity > 1
													? updateQuantity(
															item.id,
															quantity - 1
													  )
													: //   const updateQuantity = useCallback((itemId, newQuantity) => {
													  // 	dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, newQuantity } });
													  // }, []);
													  removeFromCart(item.id);
												// const removeFromCart = useCallback((itemId) => {
												// 	dispatch({ type: "REMOVE_ITEM", payload: { itemId } });
												// }, []);
											}}
											className=" w-8 h-8 rounded-full bg-amber-900/40 dark:bg-dark  flex items-center justify-center hover:bg-amber-800/50 transition-colors"
										>
											<svg
												stroke="currentColor"
												fill="currentColor"
												strokeWidth="0"
												viewBox="0 0 448 512"
												className=" text-gray-900 dark:text-white"
												height="1em"
												width="1em"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
											</svg>
										</button>

										{/* quantity */}
										<span className=" w-8 text-center text-gray-900 dark:text-white font-bold text-2xl">
											{toBanglaNumber(quantity)}
										</span>

										{/* Plus button */}
										<button
											onClick={() => {
												updateQuantity(
													item.id,
													quantity + 1
												);
												//   const updateQuantity = useCallback((itemId, newQuantity) => {
												// 	dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, newQuantity } });
												// }, []);
											}}
											className=" w-8 h-8 rounded-full bg-amber-900/40 dark:bg-dark flex items-center justify-center hover:bg-amber-800/50 transition-colors"
										>
											<svg
												stroke="currentColor"
												fill="currentColor"
												strokeWidth="0"
												viewBox="0 0 448 512"
												className=" text-gray-900 dark:text-white"
												height="1em"
												width="1em"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
											</svg>
										</button>
									</div>
								) : (
									<div className=" flex justify-center gap-2">
										{/* Not selected */}
										<button
											onClick={() => {
												addToCart(item, 1);
												// DEFINITION
												// const addToCart = useCallback((item, quantity) => {
												// 		dispatch({ type: "ADD_ITEM", payload: { item, quantity } });
												// 	}, []);
											}}
											className="my-2 py-1 px-4 rounded-full drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold"
										>
											<span className=" relative z-10 text-gray-900">
												অর্ডার করুন
											</span>
										</button>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default RecipeList;
