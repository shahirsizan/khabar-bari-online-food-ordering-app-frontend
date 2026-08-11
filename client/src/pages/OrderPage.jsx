import React, { useEffect, useState, useRef } from "react";
import Logo from "../assets/food-logo.png";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { FaArrowLeft } from "react-icons/fa";
import { backend_base_url } from "../workMode";
import { apiFetch } from "../utils/api";
import OrderReceipt from "../components/OrderReceipt";

const OrderPage = () => {
	const { id } = useParams();
	const [orderDetail, setOrderDetail] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isUnauthorizedIdGiven, setIsUnauthorizedIdGiven] = useState(false);
	const navigate = useNavigate();
	const receiptRef = useRef();

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

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				const response = await apiFetch(
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
					setOrderDetail(res);
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
		const element = receiptRef.current;
		const options = {
			margin: 0.5,
			filename: `order-${id}.pdf`,
			image: {
				type: "jpg",
				quality: 0.8,
			},
			html2canvas: {
				scale: 2, // Boosts resolution quality
				useCORS: true, // Fixes the missing image bug
			},
			jsPDF: {
				unit: "in",
				format: "letter",
				orientation: "portrait",
			},
		};
		html2pdf().set(options).from(element).save();
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

	const currentStatus = statusConfig[orderDetail?.status?.toLowerCase()];

	return (
		<div className="mt-10 mb-10 px-[5vw] md:px-[8vw] lg:px-[16vw]">
			<div className="max-w-2xl mx-auto mb-8">
				<button
					className="flex items-center justify-center border shadow-md px-3 py-2 rounded-md gap-2"
					onClick={() => {
						navigate("/profile/orders");
					}}
				>
					<FaArrowLeft />
					<span>Show all orders</span>
				</button>
			</div>

			<OrderReceipt orderDetail={orderDetail} receiptRef={receiptRef} />

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
