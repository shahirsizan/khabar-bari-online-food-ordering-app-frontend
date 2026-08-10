import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { backend_base_url } from "../workMode";
import { apiFetch } from "../utils/api";

export const ResetPasswordAfterLink = () => {
	const [URLSearchParams] = useSearchParams();
	const resetToken = URLSearchParams.get("resetToken");
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [showLoginButton, setShowLoginButton] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			console.log("req obj: ", { password, resetToken });

			const response = await apiFetch(
				`${backend_base_url}/api/reset-password-with-token`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ password, resetToken }),
				},
			);

			const data = await response.json();

			if (!response.ok)
				throw new Error(data.error || "Failed to reset password");

			setMessage(data.message);
			setShowLoginButton(true);
			// setTimeout(() => navigate("/login"), 3000);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
			<h2 className="text-xl font-bold mb-4">রিসেট পাসওয়ার্ড</h2>

			{message && <p className="text-green-600 mb-3">{message}</p>}

			{error && <p className="text-red-600 mb-3">{error}</p>}

			{!showLoginButton && (
				<form className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700">
							নতুন পাসওয়ার্ড সেট করুন
						</label>

						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full mt-1 p-2 border rounded-md"
						/>
					</div>

					<button
						onClick={(e) => {
							handleSubmit(e);
						}}
						disabled={loading}
						className="w-full bg-[#075e54] text-white p-2 rounded-md font-semibold"
					>
						{loading ? "আপডেট হচ্ছে..." : "আপডেট করুন"}
					</button>
				</form>
			)}

			{showLoginButton && (
				<button
					onClick={() => navigate("/login")}
					className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					লগইন করুন
				</button>
			)}
		</div>
	);
};
