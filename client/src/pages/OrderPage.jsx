import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { FaArrowLeft } from "react-icons/fa";
import { backend_base_url } from "../workMode";

const OrderPage = () => {
	const { id } = useParams();
	const [order, setOrder] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUnauthorizedIdGiven, setIsUnauthorizedIdGiven] = useState(false);
	const navigate = useNavigate();
	const receiptRef = useRef();

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				const response = await fetch(
					`${backend_base_url}/api/order/${id}`,
					{
						method: "GET",
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				// console.log("response: ", response);
				const res = await response.json();
				console.log("res: ", res);

				if (response.ok) {
					setOrder(res);
				} else {
					if (res.status === 403) {
						setIsUnauthorizedIdGiven(true);
					}
				}
			} catch (err) {
				console.error("Failed to load order: ", err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrder();
	}, [id]);

	const toBanglaNumber = (num) => {
		const b = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
		return num
			.toString()
			.split("")
			.map((d) => b[d])
			.join("");
	};

	const handleDownload = () => {
		html2pdf().from(receiptRef.current).save(`Order-${id}.pdf`);
	};

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2">
				<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
				<p className="text-md md:text-xl font-semibold text-gray-600">
					Loading Order Details...
				</p>
			</div>
		);
	}

	if (isUnauthorizedIdGiven) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2">
				<p className="text-md md:text-xl font-semibold text-gray-600">
					You are not authorized to see the order detail.
				</p>
			</div>
		);
	}

	return (
		<div className="mt-8 mx-auto max-w-3xl">
			<div className="max-w-2xl mx-auto mb-8">
				<button
					className="flex items-center justify-center border shadow-md px-3 py-2 rounded-md"
					onClick={() => {
						navigate("/profile/orders");
					}}
				>
					<FaArrowLeft />
					<span>Show all orders</span>
				</button>
			</div>

			<div
				ref={receiptRef}
				className="bg-white shadow-2xl rounded-2xl p-8 w-full border-t-8 border-green-500 font-atma"
			>
				<div className="text-center mb-6">
					<div className="text-2xl md:text-3xl mb-4">✅</div>

					<h1 className="text-xl md:text-3xl font-bold text-gray-800">
						অর্ডারের বিস্তারিত
					</h1>
				</div>

				<div className="space-y-4 text-gray-700">
					<div className="border-b pb-2">
						<p className="text-xs md:text-sm text-gray-600">
							ট্রানজ্যাকশন আইডি
						</p>
						<p className="font-semibold max-md:text-xs">
							{order.tran_id}
						</p>
					</div>

					<div className="flex justify-between">
						<div>
							<p className="text-sm text-gray-600">নাম</p>

							<p className="font-semibold">{order.userName}</p>
						</div>

						<div className="text-right">
							<p className="text-sm text-gray-600">
								টাকার পরিমাণ
							</p>

							<p className="font-semibold text-green-600 text-lg">
								{toBanglaNumber(order.totalAmount)} ৳
							</p>
						</div>
					</div>

					<div>
						<p className="text-sm text-gray-600">ডেলিভারি এড্রেস</p>

						<p className="font-semibold">
							{order.streetAddress}, {order.city}
						</p>
					</div>

					<div>
						<p className="text-sm text-gray-600">যোগাযোগ</p>

						<p className="font-semibold">{order.phone}</p>
					</div>

					<div className="mt-6">
						<h3 className="text-sm text-gray-600 mb-2">
							খাবারের তালিকা
						</h3>

						<ul className="bg-gray-200 rounded-lg p-4 space-y-2">
							{order?.cartProducts?.map((item, index) => (
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
										{toBanglaNumber(
											item.price * item.quantity,
										)}{" "}
										৳
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<button
				onClick={() => {
					handleDownload();
				}}
				className="mt-6 max-w-[250px] mx-auto text-white text-sm md:text-md py-2 px-3 rounded-full bg-indigo-600 hover:bg-indigo-700"
			>
				Download PDF
			</button>
		</div>
	);
};

export default OrderPage;
