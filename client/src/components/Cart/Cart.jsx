import React, { useState } from "react";
import { useCart } from "../../CartContext";
import { Link } from "react-router-dom";
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
				className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/40 backdrop-blur-sm p-4 overflow-auto"
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
			// console.log("inside pay");
			const { data } = await axios.post(
				`${
					import.meta.env.VITE_BACKEND_BASE_URL
				}/api/bkash/payment/create`,
				{
					amount: cartTotal,
					orderId: 1,
				},
				{ withCredentials: true }
			);
			// console.log(data);
			window.location.href = data.bkashURL;
		} catch (error) {
			console.log(error);
		}
	};

	const handleBkashPayment = async (e) => {
		try {
			setPaymentMethod("bkash");
			setShowPaymentOptionsModal(false);
			pay(e);
		} catch (err) {
			console.error("Payment failed:", err);
		}
	};

	const handleCOD = (e) => {
		setPaymentMethod("cod");
		setPaymentDone(true);
		setShowPaymentOptionsModal(false);
	};

	return (
		<div className="min-h-screen py-16 pt-32 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800">
			<div className="max-w-7xl mx-auto">
				{/* top section */}
				<h1 className=" text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-12">
					<span className=" py-4 text-5xl md:text-7xl font-atma font-bold bg-clip-text text-transparent drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary">
						কার্ট
					</span>
				</h1>

				{/* middle section- selected foods */}
				{cartItems.length === 0 ? (
					<div className="text-center pt-12">
						{/* If cart empty */}
						<p className=" mb-10 pb-5 font-atma font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary text-4xl">
							<span className="py-4 text-3xl md:text-4xl font-atma font-bold bg-clip-text text-transparent drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary">
								ফাঁকা!
							</span>
						</p>

						<Link
							to={"/#recipeList"}
							className=" py-4 px-4 rounded-lg bg-gray-200/10 border border-gray-500 drop-shadow-[0_1px_1px_gray] shadow-md"
						>
							<span className="font-atma max-[430px]:text-lg text-2xl font-bold bg-clip-text text-transparent drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary">
								খাবারের তালিকা দেখুন
							</span>
						</Link>
					</div>
				) : (
					<div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{/* If cart not empty */}
						{cartItems.map((item) => {
							return (
								<div
									key={item.id}
									className=" bg-gray-400/30 dark:bg-gray-200/20 text-gray-700 dark:text-white p-5 lg:p-6 rounded-xl shadow-lg 
                                    flex flex-col font-atma group backdrop-blur-md h-full items-center gap-3"
								>
									<div className=" w-28 h-28 flex-shrink-0 relative overflow-hidden rounded-lg cursor-pointer">
										<img
											onClick={() => {
												setSelectedImage(item.image);
												setShowImageModal(true);
												console.log(item.image);
											}}
											className=" w-full h-full object-cover"
											src={item.image}
										/>
									</div>

									{/* item name */}
									<div className=" w-full text-center">
										<h3 className=" text-2xl">
											{item.name}
										</h3>
									</div>

									<div className="flex flex-col items-center mt-auto gap-2 w-full">
										{/* price */}
										<p className="mt-1">
											<span className="text-2xl">
												ইউনিট মূল্য
											</span>{" "}
											:{" "}
											<span className=" text-2xl">
												৳ {toBanglaNumber(item.price)}
											</span>
										</p>

										{/* modify quantity */}
										<div className=" flex items-center gap-1 ">
											{/* minus button */}
											<button
												onClick={() => {
													updateQuantity(
														item.id,
														item.quantity - 1
													);
												}}
												className=" w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary cursor-pointer"
											>
												<svg
													stroke="currentColor"
													fill="currentColor"
													strokeWidth="0"
													viewBox="0 0 448 512"
													className=" w-3 h-3 dark:text-black "
													height="1em"
													width="1em"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
												</svg>
											</button>

											<span className=" w-10 text-center  text-2xl">
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
												className=" w-6 h-6 flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary cursor-pointer"
											>
												<svg
													stroke="currentColor"
													fill="currentColor"
													strokeWidth="0"
													viewBox="0 0 448 512"
													className=" w-3 h-3 dark:text-black "
													height="1em"
													width="1em"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
												</svg>
											</button>
										</div>

										{/* remove & subtotal */}
										<div className=" flex items-center justify-between w-full">
											{/* remove button */}
											<button
												onClick={() => {
													removeFromCart(item.id);
												}}
												className=" rounded-full text-xs uppercase flex items-center gap-1 cursor-pointer
                                           "
											>
												{" "}
												<span className="rounded-full px-2 py-1 text-2xl  bg-gradient-to-r from-primary to-secondary text-gray-700">
													বাদ দিন
												</span>
											</button>

											{/* item total cost */}
											<p className=" text-2xl  ">
												মোট: ৳
												{toBanglaNumber(
													item.quantity * item.price
												)}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* bottom section renders only when cart has items */}
				{cartItems.length > 0 && (
					<div className=" mt-12 pt-8 border-t border-amber-800/30">
						<div className=" flex flex-col sm:flex-row justify-between items-center gap-8">
							{/* continue shopping button */}
							<Link
								to={"/#recipeList"}
								className="my-2 py-2 px-4 rounded-full drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary  text-2xl "
							>
								<span className="text-gray-800">
									আরো অর্ডার করতে
								</span>
							</Link>

							<div className=" flex items-center gap-8">
								{/* cartTotalAmount */}
								<h2 className="font-atma text-3xl font-semibold">
									সর্বমোট: ৳{toBanglaNumber(cartTotal)}
								</h2>

								<button
									onClick={(e) => {
										setShowPaymentOptionsModal(true);
										// pay(e);
									}}
									className="my-2 py-2 px-4 rounded-full drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary  text-2xl "
								>
									<span className="text-gray-800">
										চেকআউট
									</span>
								</button>

								{showPaymentOptionsModal && (
									<div className="fixed inset-0 z-10 flex justify-center items-center bg-gray-800/70 backdrop-blur-sm">
										<div className="bg-gray-100/90 p-20 rounded-xl font-atma text-lg md:text-xl flex flex-col relative">
											<span
												className="absolute right-4 top-4 text-2xl cursor-pointer px-2 py-1 bg-gray-500 rounded-full text-white"
												onClick={() => {
													setShowPaymentOptionsModal(
														false
													);
												}}
											>
												X
											</span>

											<h2>পেমেন্ট মেথড বাছাই করুন</h2>

											<div className="flex gap-3">
												<button
													className="bg-green-600 text-white mt-3 rounded-md px-3 py-2"
													onClick={(e) => {
														handleBkashPayment(e);
													}}
												>
													বিকাশে পে করুন
												</button>

												<button
													className="bg-green-600 text-white mt-3 rounded-md px-3 py-2"
													onClick={(e) => {
														handleCOD(e);
													}}
												>
													ক্যাশ অন ডেলিভারি
												</button>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{showImageModal && imageModal()}
		</div>
	);
};

export default Cart;
