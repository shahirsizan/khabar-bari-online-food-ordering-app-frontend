import React, { useState } from "react";
import { FaLocationArrow, FaMobileAlt } from "react-icons/fa";
import footerLogo from "../../assets/food-logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
	const year = new Date().getFullYear();
	// console.log(year);

	return (
		<div className="bg-gray-100 dark:bg-gray-950">
			<section className="max-w-[1200px] mx-auto">
				<div className=" py-5 ">
					<div className="font-atma text-lg py-3 px-4 flex flex-col sm:flex-row sm:justify-between">
						<h1 className="text-xl max-sm:m-auto max-sm:text-xl sm:text-4xl font-bold sm:text-left text-justify flex items-center gap-3">
							<img
								src={footerLogo}
								className="max-[320px]:hidden w-10 drop-shadow-[0_1px_1px_black]"
							/>
							<span className="max-[320px]:text-2xl drop-shadow-[0_1px_1px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
								খাবারবাড়ি
							</span>
						</h1>

						<div className="flex max-sm:m-auto max-sm:text-xl items-center gap-3">
							<FaLocationArrow />
							<p>Dhaka, Bangladesh</p>
						</div>

						<div className="flex max-sm:m-auto max-sm:text-xl items-center gap-3">
							<FaMobileAlt />
							<p>01819991239</p>
						</div>
					</div>

					<div>
						<div className="font-atma text-center py-1 border-t-2 border-gray-300/50">
							© Copyright {year} All rights reserved
						</div>

						<div className="font-atma text-center py-1 text-xl border-gray-300/50">
							Developed by{" "}
							<Link
								to={"https://github.com/shahirsizan"}
								target="_blank"
								className="text-yellow-500"
							>
								Shahir Adil Sizan
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Footer;
