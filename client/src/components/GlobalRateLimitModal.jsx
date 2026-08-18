import { useEffect } from "react";
import { useState } from "react";
import holdUpImage from "../assets/holdup.png";

export const GlobalRateLimitModal = () => {
	const [visible, setVisible] = useState(false);
	const [seconds, setSeconds] = useState(5);

	// 1️⃣ Listener setup (Runs once at mount)
	useEffect(() => {
		const handleLimit = (e) => {
			setSeconds(e.detail.retryAfter);
			setVisible(true);
		};

		window.addEventListener("rate-limit-triggered", handleLimit);

		return () =>
			window.removeEventListener("rate-limit-triggered", handleLimit);
	}, []);

	// 2️⃣ Countdown (Runs only when visibility changes)
	useEffect(() => {
		if (!visible) {
			return;
		}
		// console.log("hi from RateLimit useEffect!");

		const timer = setInterval(() => {
			setSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setVisible(false);
					return 0;
				}

				// console.log(prev);
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [visible]); // Only runs when seconds or visibility changes

	//ℹ️ℹ️ Works. But ei puro component  ta gemini ke diye explain korate hobe.
	// How does it mount, when the useEffetcs get called, how the intervals work etc

	if (!visible) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
			<div className="bg-white p-10 rounded-xl text-center flex flex-col items-center">
				{/* Use the imported variable as the src */}
				<img
					src={holdUpImage}
					alt="Hold up meme"
					className="w-48 h-auto mb-4 rounded-md shadow-sm"
				/>
				<h2 className="text-2xl font-bold text-red-600">ধীরে চলুন!</h2>
				<p className="mt-4 font-medium">
					{seconds} সেকেন্ড অপেক্ষা করুন।
				</p>
			</div>
		</div>
	);
};
