export const generateOrderNumber = (): string => {
	const timestampSegment = Date.now().toString().slice(-6); // Last 6 digits of current timestamp
	const randomSegment = Math.random()
		.toString(36)
		.substring(2, 6)
		.toUpperCase(); // 4 random alphanumeric chars
	return `KB-orderid-${timestampSegment}-${randomSegment}`; // Example result: KB-948122-X7K9
};

export const generateTrxId = (): string => {
	const timestampSegment = Date.now().toString(); // 13 characters (e.g., 1793930580000)

	// Generate 12 random characters
	const randomSegment = Array.from({ length: 12 }, () =>
		Math.floor(Math.random() * 36).toString(36),
	)
		.join("")
		.toUpperCase();

	// Formats to exactly 30 characters
	// Structure: KB- (3) + 13 (timestamp) + - (1) + 13 (random) = 30 chars
	return `KB-trxid-${timestampSegment}-${randomSegment.substring(0, 13)}`;
};
