import { backend_base_url } from "../workMode.js";

let inMemoryToken = null;
// Lock to prevent parallel refresh calls
let refreshPromise = null;

export const setAccessToken = (token) => {
	inMemoryToken = token;
};

export const getAccessToken = () => {
	return inMemoryToken;
};

export const apiFetch = async (url, options = {}) => {
	/***
	 * Ensure cookies are sent
	 */
	options.credentials = "include";
	options.headers = {
		...options.headers,
		...(inMemoryToken ? { Authorization: `Bearer ${inMemoryToken}` } : {}),
	};

	/***
	 * Execute call
	 */
	const response = await fetch(url, options);

	/***
	 * Handle 429, Rate limit error, show error in the UI.
	 */
	if (response.status === 429) {
		// console.error("Rate limit exceeded");
		const data = await response.json();

		window.dispatchEvent(
			new CustomEvent("rate-limit-triggered", {
				detail: { retryAfter: data.retryAfter },
			}),
		);

		/***
		 * Throw error to stop remaining code to execute
		 * and crash the app entirely.
		 */
		throw new Error("429");
	}

	// now ok

	/***
	 * Handle 401, Access token expired, have to generate a new AT from RT)
	 */
	if (
		response.status === 401 &&
		!url.includes("/api/refresh-token") &&
		!options._isRetry
	) {
		try {
			if (!refreshPromise) {
				refreshPromise = fetch(
					`${backend_base_url}/api/refresh-token`,
					{ method: "POST", credentials: "include" },
				)
					.then(async (res) => {
						/***
						 * Set access token
						 */

						if (!res.ok) {
							throw new Error("Refresh failed");
						}
						const data = await res.json();
						setAccessToken(data.accessToken);
						return data.accessToken;
					})

					.catch((err) => {
						/***
						 * Throw error
						 */
						throw err;
					})
					.finally(() => {
						// Clear refreshPromise
						refreshPromise = null;
					});
			}

			const newToken = await refreshPromise;

			/***
			 * Retry original request with new AT
			 */

			options = {
				...options,
				_isRetry: true,
				headers: {
					...options.headers,
					Authorization: `Bearer ${newToken}`,
				},
			};

			/***
			 * Mark as retry and call apiFetch recursively
			 * so other error interceptor can still run later
			 */
			const newResponse = apiFetch(url, options);
			return newResponse;
		} catch (error) {
			/***
			 * RT itself is expired. Dispatch event to entirely logout user
			 */
			window.dispatchEvent(new Event("auth-session-expired"));
			return response;
		}
	}

	/***
	 * If no error, return response normally
	 */
	return response;
};
