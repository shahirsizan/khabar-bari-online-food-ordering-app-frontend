import React, { useState, useEffect } from "react";
import darkPng from "../../assets/website/dark-mode-button.png";
import lightPng from "../../assets/website/light-mode-button.png";

type ThemeMode = "light" | "dark";

const DarkMode: React.FC<{}> = () => {
	const [theme, setTheme] = useState<ThemeMode>(() => {
		const savedTheme = localStorage.getItem("theme");
		return savedTheme === "dark" || savedTheme === "light"
			? (savedTheme as ThemeMode)
			: "light";
	});

	useEffect(() => {
		const rootHtmlElement = document.documentElement;

		if (theme === "dark") {
			rootHtmlElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			rootHtmlElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [theme]);

	const toggleTheme = (): void => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"));
	};

	return (
		<button
			onClick={() => {
				toggleTheme();
			}}
			className="w-full relative md:border-none md:shadow-none shadow-xl cursor-pointer overflow-hidden h-16 flex items-center justify-center"
		>
			<img
				src={lightPng}
				className={`w-16 absolute transition-all duration-500 ${
					theme === "dark"
						? "opacity-0 rotate-180"
						: "opacity-100 rotate-0"
				}`}
			/>
			<img
				src={darkPng}
				className={`w-16 absolute transition-all duration-500 ${
					theme === "dark"
						? "opacity-100 rotate-0"
						: "opacity-0 -rotate-180"
				}`}
			/>
		</button>
	);
};

export default DarkMode;
