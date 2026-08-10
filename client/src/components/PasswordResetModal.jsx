import React, { useState } from "react";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";

export default function PasswordResetModal({ isModalOpen, onClose }) {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	console.log("in password reset 0");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email || !email.trim()) {
			return;
		}

		setIsLoading(true);
		setMessage({ type: "", text: "" });

		console.log("in password reset 1");

		try {
			console.log("in password reset 2");
			const response = await apiFetch(
				`${backend_base_url}/api/forgot-password`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ email }),
				},
			);
			console.log("in password reset 3");

			const data = await response.json();
			if (!response.ok) {
				throw new Error(
					data.error || data.message || "Something went wrong",
				);
			}

			setMessage({
				type: "success",
				text: "লিংক পাঠানো হয়েছে! আপনার ইমেইল চেক করুন।",
			});
			setEmail("");
		} catch (error) {
			setMessage({
				type: "error",
				text:
					error.message || "Something went wrong. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
			<div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden transform transition-all">
				<div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
					<h3 className="text-lg font-semibold text-gray-900">
						পাসওয়ার্ড রিসেট করুন
					</h3>

					<button
						type="button"
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold max-w-[30px] max-h-[30px] flex items-center justify-center rounded-full hover:bg-gray-100"
						aria-label="Close modal"
					>
						&times;
					</button>
				</div>

				<form className="p-6">
					<p className="text-sm text-gray-600 mb-4">
						আপনার ইমেইল এড্রেস দিন। আপনাকে একটি লিংক পাঠানো হবে।
						সেখানে ক্লিক করে পাসওয়ার্ড রিসেট করতে পারবেন।
					</p>

					{message.text && (
						<div
							className={`p-3 rounded-lg text-sm mb-4 ${
								message.type === "success"
									? "bg-green-50 text-green-700 border border-green-200"
									: "bg-red-50 text-red-700 border border-red-200"
							}`}
						>
							{message.text}
						</div>
					)}

					<div className="mb-5">
						<input
							id="reset-email"
							type="email"
							required
							disabled={isLoading}
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
						>
							বাদ দিন
						</button>

						<button
							onClick={(e) => {
								handleSubmit(e);
							}}
							disabled={isLoading}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-blue-500 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
						>
							{isLoading ? "অপেক্ষা করুন..." : "সাবমিট করুন"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
