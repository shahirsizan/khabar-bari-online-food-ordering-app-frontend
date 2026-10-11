import { backend_base_url } from "../../workMode.ts";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useCart } from "../../CartContext";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { useSearchParams } from "react-router-dom";
import OrderReceipt from "../OrderReceipt.tsx";
import { toast } from "react-toastify";

export interface IOrderDetail {
	_id: string;
	tran_id: string;
	totalAmount: string;
	userName: string;
	userEmail: string;
	phone: string;
	streetAddress: string;
	city: string;
	cartProducts: {
		id: string;
		name: string;
		price: number;
		quantity: number;
	}[];
	paid: boolean;
	[key: string]: any;
}

const Success2: React.FC<{}> = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isFailed, setIsFailed] = useState<boolean>(true);
	const [orderDetail, setOrderDetail] = useState<IOrderDetail | null>(null);
	const { clearCart } = useCart() as { clearCart: () => void };
	const [searchParams] = useSearchParams();
	const tranId = searchParams.get("tranId");

	const receiptRef = useRef<HTMLDivElement>(null);

	/***
	 * Polling info whether payment executed successfully or not
	 * at an interval of 2 seconds.
	 */
	useEffect(() => {
		let intervalId: number;
		const startTime = Date.now();
		const TIMEOUT_LIMIT = 20000; // 10 seconds

		const verifyPayment = async () => {
			// If timedout, we show failure message
			if (Date.now() - startTime > TIMEOUT_LIMIT) {
				setIsLoading(false);
				setIsFailed(true);
				clearInterval(intervalId);
				toast.error("Network Error!");
				return;
			}

			try {
				const response = await axios.get(
					`${backend_base_url}/api/payment/status/${tranId}`,
				);

				// if paid, get into if block. Else bypass it
				if (response.data.paid) {
					setIsLoading(false);
					setIsFailed(false);
					setOrderDetail(response.data.orderDetail);
					clearInterval(intervalId);
					localStorage.removeItem("cart");
					clearCart();
					toast.success("আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!");
					return;
				}

				// This is `success` page. So `paid` is supposed to be `true`.
				// If not, there might be some network problem.
				// we let the interval run again until timeout
			} catch (err: unknown) {
				setIsLoading(false);
				setIsFailed(true);
				clearInterval(intervalId);
				if (err instanceof Error) {
					console.error("Verification failed: ", err.message);
				}
				toast.error("নেটওয়ার্ক জনিত সমস্যা!");
			}
		};

		if (tranId) {
			intervalId = setInterval(verifyPayment, 2000);
		} else {
			setIsLoading(false);
			setIsFailed(false);
		}

		// Cleanup at unmount
		return () => clearInterval(intervalId);
	}, [tranId]);

	const handleDownload = (): void => {
		const element = receiptRef.current;

		if (!element) {
			return;
		}

		const opt = {
			margin: 1,
			filename: `Receipt-order-${orderDetail?._id}.pdf`,
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: { scale: 2 },
			jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
		};
		html2pdf().set(opt).from(element).save();
	};

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2">
				<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
				<p className="text-xs md:text-lg font-semibold text-gray-600">
					অপেক্ষা করুন...
				</p>
			</div>
		);
	} else if (!isLoading && isFailed) {
		return (
			<div className="h-screen flex flex-col items-center justify-center bg-gray-50 gap-2">
				<p className="text-sm md:text-lg text-gray-600 mb-4">
					নেটওয়ার্ক এরর!
				</p>

				<button
					onClick={() => window.location.reload()}
					className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 max-w-[200px] lg:max-w-[300px]"
				>
					পেমেন্ট স্ট্যাটাস চেক করুন
				</button>
			</div>
		);
	} else if (!isLoading && !isFailed && orderDetail) {
		return (
			<div className="mt-10 mb-10 bg-gray-100 flex flex-col gap-2 items-center justify-center font-atma">
				{/* The Printable Receipt Area */}
				<OrderReceipt
					orderDetail={orderDetail}
					receiptRef={receiptRef}
				/>

				{/* Download & Back button */}
				<div className="mt-10 flex gap-4">
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
