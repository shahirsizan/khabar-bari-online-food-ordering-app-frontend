import axios from "axios";
import { useEffect, useState } from "react";
import { useCart } from "../../CartContext";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

const Success = () => {
	const { paymentMethod } = useCart();
	const { cartItems } = useCart();
	const [loading, setLoading] = useState(true);
	const [paymentDetail, setPaymentDetail] = useState(null);

	const receiptRef = useRef();

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
				`https://khabar-bari-server.onrender.com/api/bkash/payment/${trxID}`
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
			<>
				{/* receipt */}
				<div
					ref={receiptRef}
					className="pt-24 px-3 md:pt-36 flex justify-center items-center font-atma"
				>
					<div className="bg-white shadow-2xl rounded-xl p-6 w-full max-w-xl text-gray-800 border border-gray-200 dark:bg-gray-950 dark:text-white duration-200">
						<h2 className=" lg:text-2xl font-semibold text-green-600 mb-2 text-center">
							আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে
						</h2>

						<div className="mb-4 text-sm md:text-xl duration-200">
							<p>
								<span className="font-medium">
									লেনদেন নম্বর (trxID):{" "}
									<span className="font-semibold">
										{paymentDetail.trxID}
									</span>
								</span>
							</p>

							<p className="">
								<span className="font-medium lg:text-2xl">
									সময়:
								</span>{" "}
								{}
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

						<h3 className="text-sm md:text-xl lg:text-2xl border-b-2 pb-1 mb-2">
							আপনার অর্ডার
						</h3>

						<div className="space-y-1 text-sm md:text-xl lg:text-2xl duration-200">
							{cartItems.map((item, index) => (
								<div
									key={item.id}
									className="flex justify-between"
								>
									<span>
										{toBanglaNumber(index + 1)}. {item.name}
										<span className="max-sm:text-[12px]">
											({toBanglaNumber(item.quantity)}টি )
										</span>
									</span>

									<span>
										৳{toBanglaNumber(item.price)}/প্রতি
									</span>
									<span>
										সাবটোটাল ৳
										{toBanglaNumber(
											item.quantity * item.price
										)}{" "}
									</span>
								</div>
							))}
						</div>

						<div className="mt-4 text-right ">
							<p className="font-bold text-gray-700 dark:text-white  text-sm md:text-xl lg:text-2xl duration-200">
								টোটাল: ৳{toBanglaNumber(paymentDetail.amount)}
							</p>
						</div>
					</div>
				</div>

				{/* download receipt */}
				<div className="font-atma flex justify-center mt-6 mb-6">
					<button
						onClick={() => {
							html2pdf()
								.set({
									margin: 0.5,
									filename: `receipt_${paymentDetail.trxID}.pdf`,
									image: { type: "jpeg", quality: 0.98 },
									html2canvas: { scale: 2 },
									jsPDF: {
										unit: "in",
										format: "a4",
										orientation: "portrait",
									},
								})
								.from(receiptRef.current)
								.save();
						}}
						className="drop-shadow-[0_1px_1px_black] bg-gradient-to-r from-primary to-secondary/95 hover:scale-105 duration-200 text-white text-2xl py-3 px-8 rounded-full"
					>
						<span className="drop-shadow-[0_1px_1px_black] font-semibold">
							রশিদ ডাউনলোড করুন
						</span>
					</button>
				</div>
			</>
		);
	}
};

export default Success;
