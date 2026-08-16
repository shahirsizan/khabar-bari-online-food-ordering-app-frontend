import { backend_base_url } from "../workMode";
import React, { useEffect, useState } from "react";
import { useCart } from "../CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ImageModal from "../components/ImageModal";
import { MdDeleteForever } from "react-icons/md";
import { FaInfoCircle } from "react-icons/fa";
import { useUserContext } from "../UserContext";
import { toBanglaNumber } from "../utils/toBanglaNumber";
import { apiFetch } from "../utils/api";
import { toast } from "react-toastify";

const CartPage = () => {
	const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
	const navigate = useNavigate();
	const location = useLocation(); // get current route info
	const { user, isAuthenticated, logoutUser } = useUserContext();
	const [paymentDone, setPaymentDone] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [showImageModal, setShowImageModal] = useState(false);
	const [loadingBkash, setLoadingBkash] = useState(false);
	const [showPaymentOptionsModal, setShowPaymentOptionsModal] =
		useState(false);

	// const handleCheckoutClick = () => {
	// 	setShowPaymentOptionsModal(true);
	// };

	// const pay = async (e) => {
	// 	try {
	// 		console.log("invoking pay():", {
	// 			amount: cartTotal,
	// 			orderId: 1,
	// 			user,
	// 		});

	// 		const { data } = await axios.post(
	// 			// `https://khabar-bari-server.onrender.com/api/bkash/payment/create`,
	// 			`${backend_base_url}/api/bkash/payment/create`,
	// 			{
	// 				amount: cartTotal,
	// 				orderId: 1,
	// 				user,
	// 			},
	// 			{ withCredentials: true },
	// 		);

	// 		// github e upload er por nicher code use korte hobe. uporer code local machine er jonno
	// 		// const { data } = await axios.post(
	// 		// 	`https://khabar-bari-server.onrender.com/api/bkash/payment/create`,
	// 		// 	{
	// 		// 		amount: cartTotal,
	// 		// 		orderId: 1,
	// 		// 	},
	// 		// 	{ withCredentials: true }
	// 		// );

	// 		// Artificial delay before redirecting to callback URL
	// 		// setTimeout(() => {
	// 		// 	setLoadingBkash(false);
	// 		// 	window.location.href = data.bkashURL;
	// 		// }, 4000);

	// 		window.location.href = data.bkashURL;
	// 	} catch (error) {
	// 		console.log("error in pay(): ", error);
	// 	}
	// };

	const handlePayment = async (e) => {
		// If not authenticated, redirect to "/login"
		if (!isAuthenticated) {
			/***
			 * Once unauthenticated user logs in through /login page, the `login` component can grab `state.from` and
			 * redirect them back to the `from` route, instead of dumping them onto a generic home page.
			 */
			toast.warn("Please login");
			navigate("/login", { state: { from: location.pathname } });

			// halt any further code execution in the current component,
			// preventing the private content or API calls from loading.
			return;
		}

		// If authenticated, proceed.
		try {
			setShowPaymentOptionsModal(false);
			// setLoadingBkash(true); // Start loading

			const data = {
				amount: cartTotal,
				orderId: 1,
				user,
				cartItems,
			};
			// console.log("invoking pay(), data: ", data);

			try {
				const response = await apiFetch(
					`${backend_base_url}/api/order`,
					{
						method: "POST",
						headers: {
							"content-type": "application/json",
							token: JSON.parse(localStorage.getItem("token")),
						},
						body: JSON.stringify(data),
					},
				);

				if (response.ok) {
					const res = await response.json();
					// console.log("res: ", res);
					window.location.replace(res.redirectUrl);
				} else {
					toast.error("Checkout process error. Please try again.");
					// dorkar nai. Emni kono info na dekhaleo hobe. User again chekckout korbe
					// logoutUser();
				}
			} catch (error) {
				console.error(error.message);
				toast.error("Checkout process error. Please try again.");
			}
			// pay(e);
		} catch (err) {
			console.error("Payment failed:", err);
			toast.error("Checkout process error. Please try again.");
		}
	};

	// Prevent scrolling when menu is open
	useEffect(() => {
		if (showPaymentOptionsModal) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [showPaymentOptionsModal]);

	return (
		<section className="relative min-h-screen pt-10 pb-28 font-atma px-[5vw] md:px-[8vw] lg:px-[10vw]">
			{/* TOP: TITLE */}
			<h1 className="text-3xl lg:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[2px_1px_2px_black] text-center py-4 mb-12">
				কার্ট
			</h1>

			{/* MIDDLE: CART */}
			{cartItems.length === 0 ? (
				<div className="CART-EMPTY text-center pt-4 sm:pt-12">
					<p className="mb-4 sm:mb-10 pb-5 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_1px_black]">
						<span className="py-4 text-3xl lg:text-5xl font-semibold">
							আপনার কার্ট ফাঁকা!
						</span>
					</p>

					<Link
						to={"/#recipeList"}
						className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary drop-shadow-[0_1px_1px_gray] hover:scale-110 duration-200"
					>
						<span className="text-white text-lg lg:text-2xl font-semibold drop-shadow-[2px_1px_2px_black]">
							খাবারের তালিকা দেখুন
						</span>
					</Link>
				</div>
			) : (
				<div className="CART-NOT-EMPTY flex flex-col gap-4">
					{/* CART ROWS */}
					{cartItems.map((item) => (
						<div
							key={item.id}
							className="flex flex-col sm:flex-row md:grid md:grid-cols-[80px_1fr_120px_120px_100px] gap-4 items-center bg-white p-4 rounded-xl shadow-md border border-gray-100"
						>
							{/* TOP SECTION FOR MOBILE (Image + Name + Delete) */}
							<div className="flex w-full items-center gap-4 md:contents">
								{/* IMAGE 🖼️ */}
								<div className="w-16 h-16 sm:w-14 sm:h-14 md:w-20 md:h-20 flex-shrink-0 overflow-hidden rounded-lg">
									<img
										onClick={() => {
											setSelectedImage(item.image);
											setShowImageModal(true);
										}}
										src={item.image}
										className="w-full h-full object-cover cursor-pointer"
									/>
								</div>

								{/* NAME and PRICE */}
								<div className="font-semibold text-gray-800 flex-1 min-w-0">
									<h3 className="text-base sm:text-lg md:text-xl break-words">
										{item.name}
									</h3>

									{/* Mobile TOTAL 💵 PRICE */}
									<p className="md:hidden text-orange-600 font-bold text-base sm:text-lg md:text-xl mt-1">
										৳{toBanglaNumber(item.price)} x
										{toBanglaNumber(item.quantity)}
									</p>
								</div>

								{/* Mobile 🗑️ Remove Button (Moved here to stay cleanly aligned next to title) */}
								<div className="md:hidden flex justify-center flex-shrink-0">
									<button
										onClick={() => removeFromCart(item.id)}
										className="text-red-500 hover:text-red-700 font-semibold text-sm p-1"
									>
										<MdDeleteForever className="size-7 sm:size-8" />
									</button>
								</div>
							</div>

							{/* BOTTOM SECTION FOR MOBILE */}
							<div className="flex w-full md:w-auto items-center justify-between sm:justify-start gap-4 border-t border-gray-100 pt-3 mt-1 md:border-0 md:pt-0 md:mt-0 md:justify-center">
								<span className="md:hidden text-orange-600 font-bold text-base sm:text-lg md:text-xl">
									সাবটোটাল: ৳
									{toBanglaNumber(item.price * item.quantity)}
								</span>

								{/* (Quantity Controls)  */}
								<div className="flex items-center gap-2">
									<button
										onClick={() =>
											updateQuantity(
												item.id,
												item.quantity - 1,
											)
										}
										className="w-8 h-8 md:w-auto md:h-auto flex items-center justify-center p-1 text-xl md:text-3xl rounded-full bg-gray-100 hover:bg-gray-200"
									>
										-
									</button>

									<span className="w-8 text-center font-semibold text-base sm:text-lg md:text-xl">
										{toBanglaNumber(item.quantity)}
									</span>

									<button
										onClick={() =>
											updateQuantity(
												item.id,
												item.quantity + 1,
											)
										}
										className="w-8 h-8 md:w-auto md:h-auto flex items-center justify-center p-1 text-xl md:text-3xl rounded-full bg-gray-100 hover:bg-gray-200"
									>
										+
									</button>
								</div>
							</div>

							{/* TOTAL 💵 PRICE */}
							<div className="hidden md:block text-right font-semibold">
								{/* ৳{toBanglaNumber(item.quantity * item.price)} */}
								<span className=" text-orange-600 font-bold text-base md:text-sm">
									সাবটোটাল: ৳
									{toBanglaNumber(item.price * item.quantity)}
								</span>
							</div>

							{/* REMOVE 🗑️ BUTTON (Desktop only) */}
							<div className="hidden md:flex justify-center max-w-10 md:max-w-14">
								<button
									onClick={() => removeFromCart(item.id)}
									className="text-red-500 hover:text-red-700 font-semibold text-sm px-2 py-1"
								>
									<MdDeleteForever className="size-7 md:size-10" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* BOTTOM: RENDERS ONLY WHEN CART HAS ITEM */}
			{cartItems.length > 0 && (
				<div className="mt-12 pt-8 border-t-4 border-amber-800/20">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-8">
						<div className="w-full flex items-center gap-5 max-md:justify-between">
							{/* CART TOTAL */}
							<button
								disabled
								className="w-full text-3xl md:text-5xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_0px_1px_black]"
							>
								<span className="whitespace-nowrap ">
									সর্বমোট: ৳{toBanglaNumber(cartTotal)}{" "}
								</span>
							</button>

							{/* DUMMY SPACE ELEMENT */}
							<div className="max-md:hidden flex-grow"></div>

							{/* PAY BUTTON */}
							<button
								onClick={(e) => {
									isAuthenticated
										? setShowPaymentOptionsModal(true)
										: handlePayment(e);
								}}
								className="max-md:hidden w-full max-w-80 py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[2px_1px_2px_black] cursor-pointer self-center"
							>
								<span className="text-white text-md lg:text-xl font-semibold drop-shadow-[2px_1px_2px_black] whitespace-nowrap ">
									চেকআউট
								</span>
							</button>

							{/* DUMMY SPACE ELEMENT */}
							<div className="max-md:hidden flex-grow"></div>

							{/* ARO ORDER KORTE */}
							<Link
								to={"/#recipeList"}
								className="max-md:hidden w-full py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[2px_1px_2px_black] cursor-pointer self-center"
							>
								<span className="text-white text-md lg:text-xl font-semibold drop-shadow-[2px_1px_2px_black] whitespace-nowrap">
									আরো অর্ডার করতে
								</span>
							</Link>
						</div>

						{/* MOBILE PAY BUTTON */}
						<button
							onClick={(e) => {
								isAuthenticated
									? setShowPaymentOptionsModal(true)
									: handlePayment(e);
							}}
							className="md:hidden max-w-80 py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[2px_1px_2px_gray] hover:scale-105 duration-200"
						>
							<span className="text-white text-md lg:text-xl font-semibold drop-shadow-[2px_1px_2px_black] whitespace-nowrap ">
								চেকআউট
							</span>
						</button>

						{/* MOBILE ARO ORDER KORTE */}
						<Link
							to={"/#recipeList"}
							className="md:hidden py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[0_1px_1px_gray] hover:scale-110 duration-200"
						>
							<span className="text-white text-md lg:text-xl font-semibold drop-shadow-[2px_1px_2px_black] whitespace-nowrap">
								আরো অর্ডার করতে...
							</span>
						</Link>
					</div>
				</div>
			)}

			{showPaymentOptionsModal && (
				<div className="fixed inset-0 z-10 flex justify-center items-center bg-gray-800/70 backdrop-blur-sm">
					<div className="bg-gray-100/90 p-5 sm:p-20 rounded-xl text-xs md:text-lg w-2/3 flex flex-col relative">
						{/* CLOSE BUTTON */}
						<span
							className="absolute right-4 top-4 text-sm md:text-xl cursor-pointer px-2 py-1 bg-gray-500 rounded-full text-white"
							onClick={() => {
								setShowPaymentOptionsModal(false);
							}}
						>
							x
						</span>

						{/* BUTTONS */}
						<div className="flex flex-col md:flex-row max-sm:mt-10 justify-center gap-3">
							{/* BKASH */}
							<button
								className="bg-green-600 text-white mt-3 rounded-md px-3 py-2 hover:scale-105 transition-all"
								onClick={(e) => {
									handlePayment(e);
								}}
							>
								<span className="whitespace-nowrap">
									SSLCommerz এ পে করুন: ৳
									{toBanglaNumber(cartTotal)}
								</span>
							</button>
						</div>

						{/* Address reminder */}
						<div className=" bg-amber-100 text-amber-900 p-4 rounded-md border border-amber-300  shadow-sm leading-7 mt-4">
							<p className="">আপনার ঠিকানা:</p>

							<p>
								<span className="font-semibold">এলাকা:</span>{" "}
								{user?.streetAddress}
							</p>
							<p>
								<span className="font-semibold">শহর:</span>{" "}
								{user?.city}
							</p>
							<p>
								<span className="font-semibold">মোবাইল:</span>{" "}
								{user?.phone}
							</p>

							<p className="pt-5">
								ঠিকানা পরিবর্তন করতে{" "}
								<span
									className="text-blue-900 font-semibold cursor-pointer"
									onClick={() => {
										navigate("/profile");
									}}
								>
									{" "}
									ক্লিক করুন{" "}
								</span>
								{/* <span
									className="text-blue-900 font-semibold cursor-pointer"
									onClick={() => {
										navigate("/profile");
									}}
								>
									{" "}
									ক্লিক করুন{" "}
								</span> */}
							</p>
						</div>

						{/* bkash notes */}
						{/* <div className="bg-amber-100 text-amber-900 p-4 rounded-md border border-amber-300  shadow-sm leading-7 mt-4">
							<p>
								১। Successfull transaction টেস্ট করার জন্য{" "}
								<strong>01929918378</strong> অথবা{" "}
								<strong>01770618575</strong>
							</p>

							<p>
								২। Insufficient balance টেস্ট করার জন্য{" "}
								<strong>01823074817</strong> ব্যবহার করুন
							</p>
							<p>
								৩। <strong>123456</strong> উভয় ক্ষেত্রে
								Verification code
							</p>
							<p>
								৪। <strong>12121</strong> উভয় ক্ষেত্রে PIN
							</p>
						</div> */}
					</div>
				</div>
			)}

			{showImageModal && (
				<ImageModal
					setShowImageModal={setShowImageModal}
					selectedImage={selectedImage}
				/>
			)}

			{loadingBkash && (
				<div className="font-atma fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
					<div className="flex flex-col items-center gap-4 bg-white/90 dark:bg-gray-900/90 p-8 rounded-2xl shadow-2xl">
						{/* Spinner */}
						<div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink-500 border-t-transparent"></div>

						{/* Text */}
						<h2 className="text-xl md:text-3xl font-bold text-pink-600 dark:text-pink-400 tracking-wide text-center">
							বিকাশ লোড হচ্ছে...
						</h2>
					</div>
				</div>
			)}
		</section>
	);
};

export default CartPage;
