import { Request, Response, NextFunction, RequestHandler } from "express";

/***
 * Key = IP Address (string), Value = Timestamps array (number[])
 */
const requestLogsMap = new Map<string, number[]>();

/***
 * Factory pattern to produce a middleware function.
 */
const slidingWindowLimiter = (
	windowSizeMs: number,
	maxRequests: number,
): RequestHandler => {
	/***
	   1. It returns a `Response` object if the rate limit is violated and execution terminates 
	   early with a 429 status code block.
	   2. It returns void (nothing) if the request is cleared, execution triggers next(), and 
	   passes control down the stack.
	 */
	return (
		req: Request,
		res: Response,
		next: NextFunction,
	): void | Response => {
		const ip: string = req.ip || "unknown";
		const currentTime: number = Date.now();

		// 1. get timestamps against this particular IP
		let timestampsList: number[] = requestLogsMap.get(ip) || [];

		// 2. remove logs older than the window
		timestampsList = timestampsList.filter(
			(timestamp) => currentTime - timestamp < windowSizeMs,
		);

		console.log("timestamps.length: ", timestampsList.length);

		// 3. Check if limit is exceeded
		if (timestampsList.length >= maxRequests) {
			return res.status(429).json({
				message: "Too many requests.",
				retryAfter: 5, // seconds
			});
		}

		// 4. Add current request timestamp and delegate to next()
		timestampsList.push(currentTime);
		requestLogsMap.set(ip, timestampsList);

		next();
	};
};

export default slidingWindowLimiter;
