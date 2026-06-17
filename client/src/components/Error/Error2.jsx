import React from "react";
import { useSearchParams } from "react-router-dom";

const Error2 = () => {
	const [searchParams] = useSearchParams();
	const tranId = searchParams.get("tranId");

	return (
		<div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
			<div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
				<div className="text-5xl mb-4">❌</div>

				<h1 className="text-2xl font-bold text-red-600 mb-2">
					দুঃখিত, আপনার ট্রানজ্যাকশনটি সফল হয়নি।
				</h1>

				{tranId && (
					<p className="text-xs text-gray-400 mb-6">ID: {tranId}</p>
				)}

				<a
					href="/cart"
					className="block w-full bg-red-600 text-white py-2 rounded-full font-semibold hover:bg-red-700 transition"
				>
					পুনরায় চেষ্টা করুন
				</a>
			</div>
		</div>
	);
};

export default Error2;
