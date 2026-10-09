import React from "react";
import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Error2: React.FC<{}> = () => {
	useEffect(() => {
		toast.warn("আপনার ট্রানজ্যাকশন টি সফল হয়নি।");
	}, []);

	return (
		<div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
			<div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-[70vw]">
				<div className="text-5xl mb-4">❌</div>

				<h1 className="text-xl font-bold text-red-600 mb-2">
					দুঃখিত, আপনার ট্রানজ্যাকশন টি সফল হয়নি! <br />
					অনুগ্রহ করে পুনরায় চেষ্টা করুন।
				</h1>

				<Link
					to="/cart"
					className="block w-full bg-red-600 text-white py-2 rounded-full font-semibold hover:bg-red-700 transition"
				>
					Cart এ ফিরে যান
				</Link>
			</div>
		</div>
	);
};

export default Error2;
