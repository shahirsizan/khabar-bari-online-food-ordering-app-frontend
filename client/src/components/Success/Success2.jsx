import { backend_base_url } from "../../workMode";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useCart } from "../../CartContext";
import html2pdf from "html2pdf.js";
import { useParams, useSearchParams } from "react-router-dom";

const Success2 = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isFailed, setIsFailed] = useState(true);
	const [orderDetail, setOrderDetail] = useState(null);
	const { clearCart } = useCart();
	const [searchParams] = useSearchParams();
	const tranId = searchParams.get("tranId");

	const receiptRef = useRef();

	useEffect(() => {
		let intervalId;
		const startTime = Date.now();
		const TIMEOUT_LIMIT = 20000; // 10 seconds

		const verifyPayment = async () => {
			// If timedout, we show the failure message
			if (Date.now() - startTime > TIMEOUT_LIMIT) {
				setIsLoading(false);
				setIsFailed(true);
				clearInterval(intervalId);
				return;
			}

			try {
				const response = await axios.get(
					`${backend_base_url}/api/payment/status/${tranId}`,
				);

				// if money paid, get into if block. Else bypass it
				if (response.data.paid) {
					setIsLoading(false);
					setIsFailed(false);
					setOrderDetail(response.data.orderDetail);
					clearInterval(intervalId); // Stop checking
					localStorage.removeItem("cart"); // Clear cart items from browsers localstorage.
					clearCart(); // Clear cart items from context as well.
					return;
				}

				// This is `success` page. So `paid` is supposed to be `true`.
				// If not, there might be some network problem.
				// we let the interval run again until timeout
			} catch (err) {
				setIsLoading(false);
				setIsFailed(true);
				clearInterval(intervalId); // Stop checking
				console.error("Verification failed: ", err.message);
			}
		};

		if (tranId) {
			intervalId = setInterval(verifyPayment, 2000);
		}

		// cleanup
		return () => clearInterval(intervalId);
	}, [tranId]);

	const handleDownload = () => {
		const element = receiptRef.current;
		const opt = {
			margin: 1,
			filename: `Receipt-${tranId}.pdf`,
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
		};
		html2pdf().set(opt).from(element).save();
	};

	const toBanglaNumber = (number) => {
		if (number === null || number === undefined) {
			return "০";
		} // Default fallback

		const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
		return number
			.toString()
			.split("")
			.map((d) => banglaDigits[parseInt(d)])
			.join("");
	};

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2">
				<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
				<p className="text-md md:text-xl font-semibold text-gray-600">
					Verifying your payment...
				</p>
			</div>
		);
	} else if (!isLoading && isFailed) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
				<p className="text-sm md:text-lg text-gray-600 mb-4">
					Network Error!
				</p>

				<button
					onClick={() => window.location.reload()}
					className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 max-w-[200px] lg:max-w-[300px]"
				>
					Try Again
				</button>
			</div>
		);
	} else if (!isLoading && !isFailed) {
		return (
			<div className="h-screen bg-gray-100 flex flex-col gap-2 items-center justify-center font-atma">
				{/* The Printable Receipt Area */}
				<div
					ref={receiptRef}
					className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border-t-8 border-green-500"
				>
					<div className="text-center mb-6">
						<div className="text-2xl md:text-3xl mb-4">✅</div>

						<h1 className="text-xl md:text-3xl font-bold text-gray-800">
							পেমেন্ট সফল হয়েছে
						</h1>
					</div>

					{orderDetail && (
						<div className="space-y-4 text-gray-700 ">
							<div className="border-b pb-2">
								<p className="text-[12px] md:text-sm text-gray-600">
									অর্ডার আইডি
								</p>

								<p className="font-semibold font-atma">
									{orderDetail._id}
								</p>
							</div>

							<div className="border-b pb-2">
								<p className="text-[12px] md:text-sm text-gray-600">
									ট্রানজ্যাকশন আইডি
								</p>

								<p className="font-semibold font-atma">
									{orderDetail.tran_id}
								</p>
							</div>

							<div className="flex justify-between">
								<div>
									<p className="text-sm text-gray-600">নাম</p>

									<p className="font-semibold">
										{orderDetail.userName}
									</p>
								</div>

								<div className="text-right">
									<p className="text-sm text-gray-600">
										টাকার পরিমাণ
									</p>

									<p className="font-semibold text-green-600 text-lg">
										{toBanglaNumber(
											orderDetail.totalAmount,
										)}{" "}
										৳
									</p>
								</div>
							</div>

							<div>
								<p className="text-sm text-gray-600">
									ডেলিভারি এড্রেস
								</p>

								<p className="font-semibold">
									{orderDetail.streetAddress},{" "}
									{orderDetail.city}
								</p>
							</div>

							<div className="mt-6">
								<h3 className="text-sm text-gray-600 mb-2">
									অর্ডারকৃত খাবারের তালিকা
								</h3>

								<ul className="bg-gray-200 rounded-lg p-4 space-y-2">
									{orderDetail?.cartProducts?.map(
										(item, index) => (
											<li
												key={index}
												className="flex justify-between border-b last:border-0 pb-1 font-semibold"
											>
												<span>
													{item.name}{" "}
													<span className="max-md:text-xs">
														x{" "}
														{toBanglaNumber(
															item.quantity,
														)}
													</span>
												</span>

												<span className="">
													{toBanglaNumber(
														item.price *
															item.quantity,
													)}
													৳
												</span>
											</li>
										),
									)}
								</ul>
							</div>
						</div>
					)}
				</div>

				{/* Action Buttons (Outside the receiptRef so they don't print) */}
				<div className="mt-8 flex gap-4">
					<button
						onClick={() => {
							handleDownload();
						}}
						className="flex items-center justify-center whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-full shadow-md"
					>
						Download Receipt PDF
					</button>

					<a
						href="/"
						className="flex items-center justify-center whitespace-nowrap bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-full"
					>
						Back to Home
					</a>
				</div>
			</div>
		);
	}
};

export default Success2;
