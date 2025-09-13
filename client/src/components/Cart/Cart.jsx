import React, { useState } from "react";
import { useCart } from "../../CartContext";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

	const imageModal = () => {
		return (
			<div
				onClick={() => {
					setShowImageModal(false);
				}}
				className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/40 backdrop-blur-sm"
			>
				<div className=" relative max-w-full max-h-full">
					<img
						className=" max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
						src={selectedImage}
					/>

					<button
						onClick={() => {
							setShowImageModal(false);
						}}
						className=" absolute top-1 right-1 bg-amber-900/80 rounded-full p-2 text-black hover:bg-amber-800/90 transition-all
                           duration-200"
					>
						<svg
							stroke="currentColor"
							fill="currentColor"
							strokeWidth="0"
							viewBox="0 0 352 512"
							className="w-6 h-6"
							height="1em"
							width="1em"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
						</svg>
					</button>
				</div>
			</div>
		);
	};

	const pay = async (e) => {
		try {
			const { data } = await axios.post(
				// `https://khabar-bari-server.onrender.com/api/bkash/payment/create`,
				`http://localhost:5000/api/bkash/payment/create`,
				{
					amount: cartTotal,
					orderId: 1,
				},
				{ withCredentials: true }
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
			console.log(error);
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
		<section className="relative min-h-screen font-atma pt-32 px-[5vw] md:px-[8vw] lg:px-[10vw]">
			{/* TOP: TITLE */}
			<h1 className=" text-5xl xl:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_1px_black] text-center py-4 mb-12">
				কার্ট
			</h1>

			{/* MIDDLE: CART */}
			{cartItems.length === 0 ? (
				// IF CART EMPTY
				<div className="cart-empty text-center pt-4 sm:pt-12">
					{/* IF CART EMPTY */}
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
				// IF CART NOT EMPTY
				<div className="cart-not-empty grid grid-cols-fluid-grid gap-3 xl:gap-4">
					{cartItems.map((item) => {
						return (
							// CARD
							<div
								key={item.id}
								className="w-full sm:max-w-[350px] flex flex-col font-atma bg-gradient-to-r from-primary to-secondary text-white p-2 xl:p-3 rounded-2xl shadow-xl 
                                     items-center gap-2"
							>
								{/* IMAGE CONTAINER */}
								<div className="w-full h-32 md:h-40 overflow-hidden flex justify-center items-center rounded-2xl cursor-pointer shadow-lg">
									<img
										onClick={() => {
											setSelectedImage(item.image);
											setShowImageModal(true);
										}}
										className="object-cover"
										src={item.image}
									/>
								</div>

								{/* ITEM NAME */}
								<div className="w-full text-center">
									<h3 className="text-2xl xl:text-3xlxl font-semibold drop-shadow-[1px_1px_1px_black]">
										{item.name}
									</h3>
								</div>

								<div className="flex flex-col items-center mt-auto gap-2 w-full">
									{/* PRICE */}
									<p className="mt-1 font-semibold drop-shadow-[1px_1px_1px_black]">
										<span className="text-2xl">
											ইউনিট মূল্য
										</span>{" "}
										:{" "}
										<span className="text-2xl">
											৳ {toBanglaNumber(item.price)}
										</span>
									</p>

									{/* MODIFY QUANTITY */}
									<div className=" flex items-center gap-1 ">
										{/* minus button */}
										<button
											onClick={() => {
												updateQuantity(
													item.id,
													item.quantity - 1
												);
											}}
											className="transition-all hover:scale-110"
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
										<span className="w-8 text-center font-semibold text-2xl drop-shadow-[1px_1px_1px_black]">
											{toBanglaNumber(item.quantity)}
										</span>

										{/* plus button */}
										<button
											onClick={() => {
												updateQuantity(
													item.id,
													item.quantity + 1
												);
											}}
											className="transition-all hover:scale-110"
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

									{/* REMOVE & SUBTOTAL */}
									<div className="flex items-center justify-between w-full">
										{/* remove button */}
										<button
											onClick={() => {
												removeFromCart(item.id);
											}}
											className="px-2 py-1 rounded-2xl flex items-center cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-r from-primary to-secondary drop-shadow-[2px_2px_2px_black]"
										>
											{" "}
											<span className="text-sm lg:text-xl drop-shadow-[1px_1px_1px_black] font-semibold whitespace-nowrap">
												বাদ দিন
											</span>
										</button>

										{/* item total cost */}
										<p className="text-xl md:text-2xl font-semibold drop-shadow-[1px_1px_1px_black]">
											<span className="whitespace-nowrap">
												মোট: ৳
												{toBanglaNumber(
													item.quantity * item.price
												)}
											</span>
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* BOTTOM: RENDERS ONLY WHEN CART HAS ITEM */}
			{cartItems.length > 0 && (
				<div className="mt-12 pt-8 border-t-4 border-amber-800/20">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-8">
						{/* CONTINUE SHOPPING BUTTON */}
						<Link
							to={"/#recipeList"}
							className="py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary/95 drop-shadow-[0_1px_1px_gray] hover:scale-110 duration-200"
						>
							<span className="text-white text-lg lg:text-2xl font-semibold drop-shadow-[1px_1px_1px_black] whitespace-nowrap">
								আরো অর্ডার করতে
							</span>
						</Link>

						<div className="w-full flex items-center gap-5">
							{/* DUMMY SPACE ELEMENT */}
							<div className="max-sm:hidden flex-grow"></div>

							{/* CART TOTAL */}
							<h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary drop-shadow-[1px_1px_1px_black]">
								<span className="whitespace-nowrap">
									সর্বমোট: ৳{toBanglaNumber(cartTotal)}
								</span>
							</h2>

							{/* DUMMY SPACE ELEMENT */}
							<div className=" flex-grow"></div>

							{/* PAY BUTTON */}
							<button
								onClick={(e) => {
									setShowPaymentOptionsModal(true);
								}}
								className="my-2 py-1 px-2 rounded-2xl drop-shadow-[1px_1px_1px_black] bg-gradient-to-r from-primary to-secondary "
							>
								<span className="text-lg sm:text-xl text-white drop-shadow-[1px_1px_1px_black]">
									চেকআউট
								</span>
							</button>

							{showPaymentOptionsModal && (
								<div className="fixed inset-0 z-10 flex justify-center items-center bg-gray-800/70 backdrop-blur-sm">
									<div className="bg-gray-100/90 p-5 sm:p-20 rounded-2xl text-md sm:text-lg md:text-xl flex flex-col relative">
										{/* CLOSE BUTTON */}
										<span
											className="absolute right-4 top-4 text-sm md:text-xl cursor-pointer px-2 py-1 bg-gray-500 rounded-full text-white"
											onClick={() => {
												setShowPaymentOptionsModal(
													false
												);
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
													বিকাশে পে করুন
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
												১। Successfull transaction টেস্ট
												করার জন্য{" "}
												<strong>01929918378</strong>{" "}
												অথবা{" "}
												<strong>01770618575</strong>
											</p>
											{/* <p>
												১। Successfull transaction টেস্ট
												করার জন্য{" "}
												<strong>01929918378</strong>{" "}
												ব্যবহার করুন
											</p> */}
											<p>
												২। Insufficient balance টেস্ট
												করার জন্য{" "}
												<strong>01823074817</strong>{" "}
												ব্যবহার করুন
											</p>
											<p>
												৩। <strong>123456</strong> উভয়
												ক্ষেত্রে Verification code
											</p>
											<p>
												৪। <strong>12121</strong> উভয়
												ক্ষেত্রে PIN
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{showImageModal && imageModal()}

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
