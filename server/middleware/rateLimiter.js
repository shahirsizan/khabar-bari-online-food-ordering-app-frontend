const requestLogs = new Map(); // map {ip -> [] of timestamp}

const slidingWindowLimiter = (windowSizeMs, maxRequests) => {
	return (req, res, next) => {
		const ip = req.ip;
		const currentTime = Date.now();

		// 1. get timestamps against this particular IP
		let timestamps = requestLogs.get(ip) || [];

		// 2. remove logs older than the window
		timestamps = timestamps.filter(
			(timestamp) => currentTime - timestamp < windowSizeMs,
		);

		console.log("timestamps.length: ", timestamps.length);

		// 3. Check if limit is exceeded
		// if (timestamps.length >= maxRequests) {
		// 	return res.status(429).json({
		// 		message: "Too many requests.",
		// 		retryAfter: 5, // seconds
		// 	});
		// }

		// 4. Add current request timestamp and delegate to next()
		timestamps.push(currentTime);
		requestLogs.set(ip, timestamps);

		next();
	};
};

export default slidingWindowLimiter;
