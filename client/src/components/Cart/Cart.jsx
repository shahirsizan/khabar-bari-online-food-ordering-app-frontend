import { backend_base_url } from "../../workMode";

import React, { useState } from "react";
import { useCart } from "../../CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ImageModal from "../ImageModal";
import { MdDeleteForever } from "react-icons/md";
import { useUserContext } from "../../UserContext";

const Cart = () => {
	const {
		cartItems,
		removeFromCart,
		updateQuantity,
		cartTotal,
		showPaymentOptionsModal,
		setShowPaymentOptionsModal,

		setPaymentMethod,
	} = useCart();
	const { user } = useUserContext();
	const [paymentDone, setPaymentDone] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [showImageModal, setShowImageModal] = useState(false);
	const [loadingBkash, setLoadingBkash] = useState(false);

	const navigate = useNavigate();

	const handleCheckoutClick = () => {
		setShowPaymentOptionsModal(true);
	};

	const toBanglaNumber = (number) => {
		const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
		return number
			.toString()
			.split("")
			.map((d) => banglaDigits[parseInt(d)])
			.join("");
	};

	const pay = async (e) => {
		try {
			console.log("invoking pay():", {
				amount: cartTotal,
				orderId: 1,
				user,
			});

			const { data } = await axios.post(
				// `https://khabar-bari-server.onrender.com/api/bkash/payment/create`,
				`${backend_base_url}/api/bkash/payment/create`,
				{
					amount: cartTotal,
					orderId: 1,
					user,
				},
				{ withCredentials: true },
			);

			// github e upload er por nicher code use korte hobe. uporer code local machine er jonno
			// const { data } = await axios.post(
			// 	`https://khabar-bari-server.onrender.com/api/bkash/payment/create`,
			// 	{
			// 		amount: cartTotal,
			// 		orderId: 1,
			// 	},
			// 	{ withCredentials: true }
			// );

			// Artificial delay before redirecting to callback URL
			// setTimeout(() => {
			// 	setLoadingBkash(false);
			// 	window.location.href = data.bkashURL;
			// }, 4000);

			window.location.href = data.bkashURL;
		} catch (error) {
			console.log("error in pay(): ", error);
		}
	};

	const handleBkashPayment = async (e) => {
		try {
			setPaymentMethod("bkash");
			setShowPaymentOptionsModal(false);
			setLoadingBkash(true); // Start loading
			pay(e);
		} catch (err) {
			console.error("Payment failed:", err);
		}
	};

	// const handleCOD = (e) => {
	// 	setPaymentMethod("cod");
	// 	setPaymentDone(true);
	// 	setShowPaymentOptionsModal(false);
	// 	navigate("/success/cod");
	// };

	return (
		<section className="relative min-h-screen font-atma px-[5vw] md:px-[8vw] lg:px-[10vw]">
			{/* TOP: TITLE */}
			<h1 className=" text-5xl xl:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_1px_black] text-center py-4 mb-12">
				কার্ট
			</h1>

			{/* MIDDLE: CART */}
			{cartItems.length === 0 ? (
				<div className="CART-EMPTY text-center pt-4 sm:pt-12">
					<p className="mb-4 sm:mb-10 pb-5 font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_1px_black]">
						<span className="py-4 text-3xl xl:text-5xl">
							আপনার কার্ট ফাঁকা!
						</span>
					</p>

					<Link
						to={"/#recipeList"}
						className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary drop-shadow-[0_1px_1px_gray] hover:scale-110 duration-200"
					>
						<span className="text-white text-lg lg:text-2xl font-semibold drop-shadow-[1px_1px_1px_black]">
							খাবারের তালিকা দেখুন
						</span>
					</Link>
				</div>
			) : (
				<div className="CART-NOT-EMPTY flex flex-col gap-4">
					{/* TABLE HEADERS (Visible only on desktop) */}
					<div className="hidden md:grid grid-cols-[80px_1fr_120px_120px_100px] gap-4 items-center px-4 font-bold text-gray-600 border-b-2 pb-2">
						<div>ছবি</div>
						<div>আইটেম</div>
						<div className="text-center">পরিমাণ</div>
						<div className="text-right">মূল্য</div>
						<div className="text-center">Action</div>
					</div>

					{/* CART ROWS */}
					{cartItems.map((item) => (
						<div
							key={item.id}
							className="grid grid-cols-[50px_1fr_60px] md:grid-cols-[80px_1fr_120px_120px_100px] gap-4 items-center bg-white p-3 rounded-xl shadow-md border border-gray-100"
						>
							{/* IMAGE */}
							<div className="w-10 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 overflow-hidden rounded-lg">
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
							<div className="font-semibold text-gray-800 ">
								<h3 className="text-sm sm:text-lg md:text-xl">
									{item.name}
								</h3>
								{/* Mobile Price Display */}
								<p className="md:hidden text-orange-600 font-bold text-sm sm:text-lg md:text-xl">
									৳{toBanglaNumber(item.price)}
								</p>
							</div>

							{/* QUANTITY CONTROLLER */}
							<div className="flex items-center justify-center gap-2">
								<button
									onClick={() =>
										updateQuantity(
											item.id,
											item.quantity - 1,
										)
									}
									className="p-1 text-lg md:text-3xl rounded-full bg-gray-100 hover:bg-gray-200"
								>
									-
								</button>

								<span className="w-8 text-center font-semibold text-md sm:text-lg md:text-xl">
									{toBanglaNumber(item.quantity)}
								</span>

								<button
									onClick={() =>
										updateQuantity(
											item.id,
											item.quantity + 1,
										)
									}
									className="p-1 text-lg md:text-3xl rounded-full bg-gray-100 hover:bg-gray-200"
								>
									+
								</button>
							</div>

							{/* TOTAL PRICE (Hidden on mobile, shown in Name block or separate) */}
							<div className="hidden md:block text-right font-semibold">
								৳{toBanglaNumber(item.quantity * item.price)}
							</div>

							{/* REMOVE BUTTON */}
							<div className="flex justify-center max-w-10 md:max-w-14">
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
						<div className="w-full flex items-center gap-5">
							{/* DUMMY SPACE ELEMENT */}
							<div className="max-sm:hidden flex-grow"></div>

							{/* CART TOTAL */}
							<h2 className="text-xl sm:text-2xl lg:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_1px_black]">
								<span className="whitespace-nowrap ">
									সর্বমোট: ৳{toBanglaNumber(cartTotal)}{" "}
								</span>
							</h2>

							{/* DUMMY SPACE ELEMENT */}
							<div className=" flex-grow"></div>

							{/* PAY BUTTON */}
							<button
								onClick={(e) => {
									setShowPaymentOptionsModal(true);
								}}
								className="py-2 px-3 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[2px_1px_2px_gray] hover:scale-105 duration-200"
							>
								<span className="text-white text-md lg:text-xl font-semibold drop-shadow-[2px_1px_2px_black] whitespace-nowrap">
									চেকআউট
								</span>
							</button>
						</div>

						{/* CONTINUE SHOPPING BUTTON */}
						<Link
							to={"/#recipeList"}
							className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[0_1px_1px_gray] hover:scale-110 duration-200"
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
					<div className="bg-gray-100/90 p-5 sm:p-20 rounded-2xl text-md sm:text-lg md:text-xl flex flex-col relative">
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
									handleBkashPayment(e);
								}}
							>
								<span className="whitespace-nowrap">
									বিকাশে পে করুন: ৳{toBanglaNumber(cartTotal)}
								</span>
							</button>

							{/* COD (DISABLED) */}
							<button
								disabled
								className="bg-green-600 disabled:bg-gray-500 text-white mt-3 rounded-md px-3 py-2"
								onClick={(e) => {
									handleCOD(e);
								}}
							>
								ক্যাশ অন ডেলিভারি{" "}
								<span className="text-sm">
									(শীঘ্রই চালু হবে)
								</span>
							</button>
						</div>

						{/* bkash notes */}
						<div className="bg-amber-100 text-amber-900 p-4 rounded-md border border-amber-300  shadow-sm leading-7 mt-4">
							<p>
								১। Successfull transaction টেস্ট করার জন্য{" "}
								<strong>01929918378</strong> অথবা{" "}
								<strong>01770618575</strong>
							</p>
							{/* <p>
												১। Successfull transaction টেস্ট
												করার জন্য{" "}
												<strong>01929918378</strong>{" "}
												ব্যবহার করুন
											</p> */}
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
						</div>
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

export default Cart;
