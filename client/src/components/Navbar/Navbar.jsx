import Logo from "../../assets/food-logo.png";
import DarkMode from "./DarkMode";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../CartContext";
import { useUserContext } from "../../UserContext";
import { toBanglaNumber } from "../../utils/toBanglaNumber";
import { useState } from "react";
import MobileMenu from "../MobileMenu";
import { FiShoppingCart } from "react-icons/fi";
import { CgMenuOreos } from "react-icons/cg";

const Navbar = () => {
	const { totalItemsCount } = useCart();
	const navigate = useNavigate();
	const { loading, isAuthenticated, user, logoutUser } = useUserContext();
	const [isMenuOpen, setIsMenuOpen] = useState(false); // for mobile

	const handleLogout = () => {
		logoutUser();
		navigate("/login");
	};

	return (
		<div className="navSection font-atma bg-white dark:bg-gray-900 dark:text-white py-3 fixed w-full z-10 shadow-md">
			<div className="container sm:py-0">
				<div className="flex justify-around items-center">
					{/* LEFT LOGO */}
					<Link
						to={"/"}
						className="flex flex-none gap-2 items-center justify-center"
					>
						<img
							src={Logo}
							className="max-sm:hidden w-12 drop-shadow-[0_1px_1px_black]"
						/>

						<span className="text-3xl md:text-4xl font-bold drop-shadow-[0_1px_1px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
							খাবারবাড়ি
						</span>
					</Link>

					{/* RIGHT BUTTONS */}
					<div className="flex  md:justify-between max-md:hidden items-center gap-4 lg:gap-6">
						{/* DARKMODE BUTTON */}
						<div className="w-12 border-none">
							<DarkMode />
						</div>

						<div className="flex items-center space-x-2 md:space-x-3 xl:space-x-5 ml-3 md:ml-3 lg:ml-6 mr-2 md:mr-3 lg:mr-4">
							<Link
								to={"/cart"}
								className="relative text-black p-2 font-serif rounded-xl group shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold"
							>
								<FiShoppingCart className="text-base md:text-lg lg:text-lg" />
								{totalItemsCount > 0 && (
									<span className="absolute -top-2 -right-2 bg-amber-600 text-sm w-5 h5 rounded-full inline-flex items-center justify-center">
										{toBanglaNumber(totalItemsCount)}
									</span>
								)}
							</Link>

							{user ? (
								<div className="flex gap-2">
									<button
										onClick={() => {
											navigate("/profile");
										}}
										className="flex items-center justify-center bg-gradient-to-r from-primary to-secondary  text-xl"
									>
										{user.name}
									</button>

									<button
										onClick={handleLogout}
										className="font-atma inline-block p-2 rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary  text-xl font-semibold"
									>
										লগআউট
									</button>
								</div>
							) : (
								<div className="flex gap-2">
									<Link
										to={"/login"}
										className="font-atma inline-block p-2 rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold"
									>
										লগইন
									</Link>

									<Link
										to={"/register"}
										className="font-atma inline-block p-2 rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold"
									>
										রেজিস্টার
									</Link>
								</div>
							)}
						</div>
					</div>

					{/* Hamburger Button (Only visible on mobile) */}
					<button
						className="md:hidden w-12 border-2 cursor-pointer"
						onClick={() => setIsMenuOpen(true)}
						aria-label="Toggle menu"
					>
						<CgMenuOreos className="size-10" />
					</button>
				</div>

				{/* HIDDEN MOBILE MENU */}
				{isMenuOpen && (
					<MobileMenu
						isOpen={isMenuOpen}
						totalItemsCount={totalItemsCount}
						onClose={() => setIsMenuOpen(false)}
						user={user}
						logout={handleLogout}
					/>
				)}
			</div>
		</div>
	);
};

export default Navbar;
