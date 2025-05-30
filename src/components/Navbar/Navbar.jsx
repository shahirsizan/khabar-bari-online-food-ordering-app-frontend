import React from "react";
import Logo from "../../assets/food-logo.png";
import { FaCartShopping } from "react-icons/fa6";
import DarkMode from "./DarkMode";
import { Link } from "react-router-dom";
import { useCart } from "../../CartContext";

const Menu = [
	{
		id: 2,
		name: "Services",
		link: "/#services",
	},
];

const Navbar = () => {
	const { totalItemsCount } = useCart();

	return (
		<div className="font-atma shadow-md bg-gray-300 dark:bg-gray-900 dark:text-white py-3">
			<div className="container py-3 sm:py-0">
				<div className="flex justify-between items-center">
					{/* left */}
					<Link
						to={"/"}
						className="font-bold text-2xl sm:text-3xl flex gap-2 justify-center"
					>
						<img
							src={Logo}
							className="max-[320px]:hidden w-10 drop-shadow-[0_1px_1px_black]"
						/>
						<span className="max-[320px]:text-2xl drop-shadow-[0_1px_1px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
							খাবারবাড়ি
						</span>
					</Link>

					{/* right */}
					<div className="flex justify-between items-center gap-4 ">
						{/* darkmode button */}
						<div>
							<DarkMode />
						</div>

						<div className=" flex items-center space-x-2 md:space-x-3 lg:space-x-4 ml-3 md:ml-3 lg:ml-6 mr-2 md:mr-3 lg:mr-4">
							<Link
								to={"/cart"}
								className="p-2 lg:p-3 rounded-xl relative group shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold"
							>
								<svg
									stroke="currentColor"
									fill="none"
									strokeWidth="2"
									viewBox="0 0 24 24"
									strokeLinecap="round"
									strokeLinejoin="round"
									className=" text-base md:text-lg lg:text-lg"
									height="1em"
									width="1em"
									xmlns="http://www.w3.org/2000/svg"
								>
									<circle cx="9" cy="21" r="1"></circle>
									<circle cx="20" cy="21" r="1"></circle>
									<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
								</svg>
								{totalItemsCount > 0 && (
									<span className="absolute -top-2 -right-2 bg-amber-600 text-xs w-5 h5 rounded-full flex items-center justify-center">
										{totalItemsCount}
									</span>
								)}
							</Link>

							{/* Desktop Login/Logout button component upore */}
							{/* {renderDesktopAuthButton()} */}
						</div>

						{/* navlinks */}
						{/* <ul className="hidden sm:flex items-center gap-4 text-xl">
							{Menu.map((item, idx) => (
								<li key={idx}>
									<a
										href={item.link}
										className="inline-block py-4 px-4 transition-all duration-100 hover:text-yellow-500 hover:scale-95"
									>
										{item.name}
									</a>
								</li>
							))}
						</ul> */}

						{/* order button */}
						{/* <button className="max-[380px]:text-sm bg-gradient-to-r from-primary to-secondary text-xl transition-all duration-100 hover:scale-95 text-gray-800 py-1 px-4 rounded-full flex items-center gap-3">
							Order
							<FaCartShopping className="text-xl text-gray-800 drop-shadow-sm cursor-pointer" />
						</button> */}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Navbar;
