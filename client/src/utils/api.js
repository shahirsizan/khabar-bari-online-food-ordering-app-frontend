export const apiFetch = async (url, options = {}) => {
	// 1. send request normally
	// console.log("apiFetch called");

	const response = await fetch(url, options);

	// 2. intercept rate limit error and fire global error using window.event
	if (response.status === 429) {
		console.error("Rate limit exceeded");
		const data = await response.json();

		window.dispatchEvent(
			new CustomEvent("rate-limit-triggered", {
				detail: { retryAfter: data.retryAfter },
			}),
		);

		// Throw an error to stop the original component from processing
		throw new Error("429");
	}

	// 3. If not 429, return the response normally
	return response;
};
