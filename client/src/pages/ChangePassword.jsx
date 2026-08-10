import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { backend_base_url } from "../workMode";
import { apiFetch } from "../utils/api";

export default function ChangePassword() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage({ type: "", text: "" });

		if (formData.newPassword !== formData.confirmPassword) {
			setMessage({
				type: "error",
				text: "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না।",
			});
			return;
		}

		if (formData.newPassword.length < 4) {
			setMessage({
				type: "error",
				text: "পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে।",
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await apiFetch(
				`${backend_base_url}/api/update-password-when-logged-in`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						token: JSON.parse(localStorage.getItem("token")),
					},
					body: JSON.stringify({
						oldPassword: formData.oldPassword,
						newPassword: formData.newPassword,
					}),
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error ||
						data.message ||
						"পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
				);
			}

			setMessage({
				type: "success",
				text: "পাসওয়ার্ড পরিবর্তন সফল হয়েছে!",
			});

			setFormData({
				oldPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error) {
			setMessage({ type: "error", text: error.message });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10 font-atma">
			<button
				className="flex items-center justify-center border shadow-md px-3 py-2 mb-5 rounded-md"
				onClick={() => {
					navigate("/profile");
				}}
			>
				<FaArrowLeft />
				<span>প্রোফাইলে ফিরে যান</span>
			</button>

			<h2 className="text-xl font-bold mb-4 text-gray-800">
				পাসওয়ার্ড পরিবর্তন করুন
			</h2>

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

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						বর্তমান পাসওয়ার্ড
					</label>
					<input
						type="password"
						name="oldPassword"
						required
						value={formData.oldPassword}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						নতুন পাসওয়ার্ড
					</label>
					<input
						type="password"
						name="newPassword"
						required
						value={formData.newPassword}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						নতুন পাসওয়ার্ড পুনরায় লিখুন
					</label>
					<input
						type="password"
						name="confirmPassword"
						required
						value={formData.confirmPassword}
						onChange={handleChange}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="w-full py-2 px-4 !text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
				>
					{isLoading ? "অপেক্ষা করুন..." : "আপডেট করুন"}
				</button>
			</form>
		</div>
	);
}
