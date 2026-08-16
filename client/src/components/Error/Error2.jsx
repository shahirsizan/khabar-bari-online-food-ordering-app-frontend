import React from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Error2 = () => {
	const [searchParams] = useSearchParams();
	const tranId = searchParams.get("tranId");

	useEffect(() => {
		toast.warn("আপনার ট্রানজ্যাকশন টি সফল হয়নি।");
	}, []);

	return (
		<div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
			<div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
				<div className="text-5xl mb-4">❌</div>

				<h1 className="text-2xl font-bold text-red-600 mb-2">
					দুঃখিত, আপনার ট্রানজ্যাকশন টি সফল হয়নি।
				</h1>

				{tranId && (
					<p className="text-xs text-gray-400 mb-6">ID: {tranId}</p>
				)}

				<a
					href="/cart"
					className="block w-full bg-red-600 text-white py-2 rounded-full font-semibold hover:bg-red-700 transition"
				>
					Cart এ ফিরে যান
				</a>
			</div>
		</div>
	);
};

export default Error2;
