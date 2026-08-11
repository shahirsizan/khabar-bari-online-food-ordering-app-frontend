import React from "react";
import Logo from "../assets/food-logo.png";

const OrderReceipt = ({ orderDetail: orderDetail, receiptRef }) => {
	// config object for dynamic visual features based on order status
	const statusConfig = {
		pending: {
			text: "অপেক্ষমান (Pending)",
			bg: "bg-yellow-100",
			textClass: "text-yellow-800",
			dot: "bg-yellow-500",
		},
		preparing: {
			text: "প্রক্রিয়াধীন (Preparing)",
			bg: "bg-blue-100",
			textClass: "text-blue-800",
			dot: "bg-blue-500",
		},
		dispatched: {
			text: "পাঠানো হয়েছে (Dispatched)",
			bg: "bg-indigo-100",
			textClass: "text-indigo-800",
			dot: "bg-indigo-500",
		},
		delivered: {
			text: "ডেলিভারি সম্পন্ন (Delivered)",
			bg: "bg-green-100",
			textClass: "text-green-800",
			dot: "bg-green-500",
		},
	};

	const currentStatus = statusConfig[orderDetail?.status?.toLowerCase()];

	const toBanglaNumber = (num) => {
		const b = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
		return num
			.toString()
			.split("")
			.map((d) => b[d])
			.join("");
	};

	return (
		<div
			ref={receiptRef}
			className="ORDERRECEIPT bg-white shadow-2xl rounded-2xl p-8 w-full border-t-8 border-green-500 font-atma"
		>
			<div className="flex gap-2 items-center justify-center mb-10">
				<img
					src={Logo}
					className="w-12 drop-shadow-[1px_1px_1px_black]"
				/>

				<span className="text-3xl rounded-lg font-semibold drop-shadow-[1px_1px_1px_black]">
					খাবারবাড়ি
				</span>
			</div>

			<div className="text-center mb-6">
				<div className="text-2xl md:text-3xl mb-4">✅</div>

				<h1 className="text-xl md:text-3xl font-bold text-gray-800">
					অর্ডারের বিস্তারিত
				</h1>
			</div>

			<div
				className={`mb-6 flex items-center justify-between p-4 rounded-xl ${currentStatus.bg}`}
			>
				<span className="text-sm font-semibold text-gray-600">
					অর্ডারের অবস্থা:
				</span>
				<div className="flex items-center gap-2">
					<span
						className={`h-2.5 w-2.5 rounded-full animate-pulse ${currentStatus.dot}`}
					></span>
					<span
						className={`text-sm md:text-base font-bold ${currentStatus.textClass}`}
					>
						{currentStatus.text}
					</span>
				</div>
			</div>

			<div className="space-y-4 text-gray-700">
				<div className="border-b pb-2">
					<p className="text-xs md:text-sm text-gray-600">
						অর্ডার আইডি
					</p>
					<p className="font-semibold max-md:text-xs">
						{orderDetail._id}
					</p>
				</div>

				<div className="border-b pb-2">
					<p className="text-xs md:text-sm text-gray-600">
						ট্রানজ্যাকশন আইডি
					</p>
					<p className="font-semibold max-md:text-xs">
						{orderDetail.tran_id}
					</p>
				</div>

				<div className="flex justify-between">
					<div>
						<p className="text-sm text-gray-600">নাম</p>

						<p className="font-semibold">{orderDetail.userName}</p>
					</div>

					<div className="text-right">
						<p className="text-sm text-gray-600">টাকার পরিমাণ</p>

						<p className="font-semibold text-green-600 text-lg">
							{toBanglaNumber(orderDetail.totalAmount)} ৳
						</p>
					</div>
				</div>

				<div>
					<p className="text-sm text-gray-600">ডেলিভারি এড্রেস</p>

					<p className="font-semibold">
						{orderDetail.streetAddress}, {orderDetail.city}
					</p>
				</div>

				<div>
					<p className="text-sm text-gray-600">যোগাযোগ</p>

					<p className="font-semibold">{orderDetail.phone}</p>
				</div>

				<div className="mt-6">
					<h3 className="text-sm text-gray-600 mb-2">
						খাবারের তালিকা
					</h3>

					<ul className="bg-gray-200 rounded-lg p-4 space-y-2">
						{orderDetail?.cartProducts?.map((item, index) => (
							<li
								key={index}
								className="flex justify-between border-b last:border-0 pb-1 font-semibold max-md:text-xs"
							>
								<span>
									{item.name}
									<span className="text-xs">
										{" "}
										x {toBanglaNumber(item.quantity)}
									</span>
								</span>

								<span>
									{toBanglaNumber(item.price * item.quantity)}{" "}
									৳
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default OrderReceipt;
