import { useEffect } from "react";
import { useState } from "react";
import holdUpImage from "../assets/holdup.png";
import SlowDownSign from "../assets/Slow-Down-Sign.png";

export const GlobalRateLimitModal = () => {
	const [visible, setVisible] = useState(false);
	const [seconds, setSeconds] = useState(5);

	/***
	 * 1️⃣ Attach event listener on mount
	 */
	useEffect(() => {
		const handleLimit = (e) => {
			setSeconds(e.detail.retryAfter);
			setVisible(true);
		};

		window.addEventListener("rate-limit-triggered", handleLimit);

		return () =>
			window.removeEventListener("rate-limit-triggered", handleLimit);
	}, []);

	/***
	 * 2️⃣ Countdown (Runs only when visibility changes)
	 */
	useEffect(() => {
		if (!visible) {
			return;
		}

		const timer = setInterval(() => {
			setSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setVisible(false);
					return 0;
				}

				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [visible]); // Only runs when seconds or visibility changes

	if (!visible) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
			<div
				className="relative w-full max-w-md p-10 rounded-xl text-center flex flex-col items-center justify-center overflow-hidden h-72 shadow-2xl bg-cover bg-center"
				style={{ backgroundImage: `url(${SlowDownSign})` }}
			>
				{/* Backdrop tint layer to make text readable */}
				<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />

				{/* Content Layer forced above the backdrop wrapper */}
				<div className="relative z-10 text-white">
					<h2 className="text-3xl font-extrabold text-red-400 drop-shadow-md">
						ধীরে চলুন!
					</h2>
					<p className="mt-4 text-lg font-semibold drop-shadow">
						{seconds} সেকেন্ড অপেক্ষা করুন।
					</p>
				</div>
			</div>
		</div>
	);
};
