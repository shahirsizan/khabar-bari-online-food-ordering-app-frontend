import React, { useState, useEffect } from "react";
import darkPng from "../../assets/website/dark-mode-button.png";
import lightPng from "../../assets/website/light-mode-button.png";

const DarkMode = () => {
	const [theme, setTheme] = useState(
		localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
	);

	const element = document.documentElement;
	// console.log("element is: ", element);
	// console.log(element.classList);

	useEffect(() => {
		if (theme === "dark") {
			element.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			element.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	}, [theme]);
	// dark/light korar logic upore shesh. Niche just button er appearence change korar logic

	return (
		<div className="relative rounded-full shadow-md">
			<img
				src={lightPng}
				onClick={() => {
					// setTheme((data) => (data === "dark" ? "light" : "dark"))
					setTheme("dark");
					console.log("clicked on light button");
				}}
				className={`w-16 cursor-pointer drop-shadow-[1px_1px_1px_rgba(0,0,0,0.1)] transition-all duration-300 absolute right-0   ${
					theme === "light" ? "opacity-100 z-10" : "opacity-0 z-9"
				} `}
			/>

			<img
				src={darkPng}
				onClick={() => {
					// setTheme((data) => (data === "dark" ? "light" : "dark"))
					console.log("clicked on dark button");
					setTheme("light");
				}}
				className={`w-16 cursor-pointer drop-shadow-[1px_1px_2px_rgba(0,0,0,0.5)] duration-300  ${
					theme === "dark" ? "opacity-100 z-10" : "opacity-0 z-9"
				}`}
			/>
		</div>
	);
};

export default DarkMode;
