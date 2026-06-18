export function formatOrderTime(isoString) {
	const orderDate = new Date(isoString);
	const now = new Date();
	const diffInMs = now - orderDate;
	const diffInMins = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMins / 60);

	// 1. Tooltip exact time (Full local format)
	const exactTime = new Intl.DateTimeFormat(navigator.language, {
		dateStyle: "medium",
		timeStyle: "medium",
	}).format(orderDate);

	// 2. Display time logic
	let displayTime = "";

	if (diffInMins < 1) {
		displayTime = "Just now";
	} else if (diffInMins < 60) {
		displayTime = `${diffInMins}m ago`;
	} else if (diffInHours < 24) {
		displayTime = `${diffInHours}h ago`;
	} else {
		// Older than 24h: show "Jun 14, 8:06 PM"
		displayTime = new Intl.DateTimeFormat(navigator.language, {
			dateStyle: "short",
			timeStyle: "short",
		}).format(orderDate);
	}

	return {
		displayTime,
		exactTime,
	};
}
