export const toBanglaNumber = (number) => {
	const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
	return number
		.toString()
		.split("")
		.map((d) => banglaDigits[parseInt(d)])
		.join("");
};
