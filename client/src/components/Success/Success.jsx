import axios from "axios";
import React, { useEffect, useState } from "react";
import { data } from "react-router-dom";
import { useCart } from "../../CartContext";

const Success = () => {
	const { paymentMethod } = useCart();
	const { cartItems } = useCart();
	const [loading, setLoading] = useState(true);
	const [paymentDetail, setPaymentDetail] = useState(null);

	const toBanglaNumber = (number) => {
		const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
		return number
			.toString()
			.split("")
			.map((d) => banglaDigits[parseInt(d)])
			.join("");
	};

	function fixBkashTimestamp(timestamp) {
		// Step 1: Replace the last colon before milliseconds with a dot
		let fixed = timestamp.replace(/:(\d{3})\sGMT/, ".$1");

		// Step 2: Replace " GMT+0600" with "+06:00"
		fixed = fixed.replace(" GMT+0600", "+06:00");

		return fixed;
	}

	useEffect(() => {
		const func = async () => {
			const trxID = new URLSearchParams(window.location.search).get(
				"trxId"
			);

			const { data } = await axios.get(
				`${
					import.meta.env.VITE_BACKEND_BASE_URL
				}/api/bkash/payment/${trxID}`
			);
			setPaymentDetail(data.paymentDetail);
			setLoading(false);

			console.log("data.paymentDetail: ", data.paymentDetail);
			console.log("cartItems: ", cartItems);
		};

		func();
	}, []);

	if (loading) {
		return (
			<div className="pt-16 text-lg font-semibold text-center">
				Loading...
			</div>
		);
	}

	if (!loading) {
		return (
			<div className="pt-24 px-3 md:pt-36 flex justify-center items-center font-atma">
				<div className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-xl text-gray-800 border border-gray-200 dark:bg-gray-950 dark:text-white duration-200">
					<h2 className="text-2xl md:text-3xl font-semibold text-green-600 mb-2 text-center">
						আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে
					</h2>

					<div className="mb-4 text-sm md:text-xl duration-200">
						{paymentMethod === "bkash" && (
							<p>
								<span className="font-medium">
									লেনদেন নম্বর (trxID):{" "}
									<span className="font-semibold">
										{paymentDetail.trxID}
									</span>
								</span>
							</p>
						)}

						<p className="">
							<span className="font-medium">সময়:</span> {}
							{new Date(
								fixBkashTimestamp(paymentDetail.date)
							).toLocaleString("bn-BD", {
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "numeric",
								minute: "2-digit",
								hour12: true,
							})}
						</p>
					</div>

					<h3 className="text-sm md:text-xl border-b-2 pb-1 mb-2">
						আপনার অর্ডার
					</h3>

					<div className="space-y-1 text-sm md:text-xl duration-200">
						{cartItems.map((item, index) => (
							<div key={item.id} className="flex justify-between">
								<span>
									{toBanglaNumber(index + 1)}. {item.name}
								</span>
								<span>{toBanglaNumber(item.quantity)}টি</span>
								<span>
									প্রতিটি ৳ {toBanglaNumber(item.price)}
								</span>
								<span>
									৳{" "}
									{toBanglaNumber(item.quantity * item.price)}{" "}
									সাবটোটাল
								</span>
							</div>
						))}
					</div>

					<div className="mt-4 text-right ">
						<p className="font-bold text-gray-700 dark:text-white  text-sm md:text-xl duration-200">
							টোটাল: ৳ {toBanglaNumber(paymentDetail.amount)}
						</p>
					</div>
				</div>
			</div>
		);
	}
};

export default Success;
