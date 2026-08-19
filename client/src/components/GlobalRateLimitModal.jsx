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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-atma">
			<div className="relative w-full h-full p-10 text-center flex flex-col items-center justify-center overflow-hidden shadow-2xl bg-cover bg-center">
				{/* Content Layer forced above the backdrop wrapper */}
				<div className="relative z-10 text-white">
					<h2 className="text-lg md:text-6xl font-extrabold text-red-500 drop-shadow-md">
						ধীরে চলুন
					</h2>

					<p className="mt-4 text-lg md:text-6xl font-semibold drop-shadow">
						{seconds}
					</p>
				</div>
			</div>
		</div>
	);
};
