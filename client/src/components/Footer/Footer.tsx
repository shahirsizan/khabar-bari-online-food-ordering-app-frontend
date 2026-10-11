import { FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import footerLogo from "../../assets/food-logo.png";
import { Link } from "react-router-dom";
import React from "react";

const Footer: React.FC<{}> = () => {
	const year = new Date().getFullYear();

	return (
		<section className="footerSection py-1 md:py-2 font-atma px-[5vw] md:px-[8vw] lg:px-[10vw] bg-gray-400/30 dark:bg-gray-900 dark:text-white duration-300">
			<div className="py-2 px-4 flex flex-col sm:flex-row sm:justify-between">
				<h1 className="max-sm:m-auto font-bold sm:text-left text-justify flex items-center gap-3">
					<img
						src={footerLogo}
						alt="Khabarbari App Logo"
						className="w-5 md:w-10 drop-shadow-[1px_1px_1px_black]"
					/>
					<span className="text-sm md:text-md bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90 drop-shadow-[1px_1px_1px_black]">
						খাবারবাড়ি
					</span>
				</h1>

				<div className="flex max-sm:m-auto items-center gap-3 font-semibold">
					<FaLocationArrow className="w-5 md:w-10" />
					<p className="text-sm md:text-md bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_1px_black]">
						Dhaka, Bangladesh
					</p>
				</div>

				<div className="flex max-sm:m-auto items-center gap-3 font-semibold">
					<FaMobileAlt className="w-5 md:w-10" />
					<p className="text-sm md:text-md bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_1px_black]">
						01819991239
					</p>
				</div>
			</div>

			<div className="text-center py-1 text-sm md:text-md">
				Engineered by:{" "}
				<a
					href={"https://github.com/shahirsizan"}
					target="_blank"
					rel="noopener noreferrer"
					className="font-semibold bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_1px_black]"
				>
					<span className="flex-nowrap">Shahir Adil Sizan</span>
				</a>
			</div>

			<div className="text-center py-1 text-sm md:text-md">
				Source Code:{" "}
				<a
					href="https://github.com/shahirsizan/khabar-bari-online-food-ordering-app-frontend"
					target="_blank"
					rel="noopener noreferrer"
					className="font-semibold bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary drop-shadow-[1px_1px_1px_black]"
				>
					Github
				</a>
			</div>

			<div className="text-center py-1 text-sm md:text-md">
				&copy; {year} খাবারবাড়ি. All rights reserved.
			</div>
		</section>
	);
};

export default Footer;
