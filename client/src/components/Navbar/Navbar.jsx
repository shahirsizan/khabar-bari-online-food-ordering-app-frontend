import Logo from "../../assets/food-logo.png";
import DarkMode from "./DarkMode";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../CartContext";
import { useUserContext } from "../../UserContext";
import { toBanglaNumber } from "../../utils/toBanglaNumber";
import { useState } from "react";
import MobileMenu from "../MobileMenu";
import NotificationDropdown from "../NotificationDropdown";
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
		<div className="navSection bg-white dark:bg-gray-900 dark:text-white py-1 fixed w-full z-10 shadow-md font-atma px-5 md:px-8 lg:px-12">
			<div className="flex justify-around items-center">
				{/* LEFT LOGO */}
				<Link
					to={"/"}
					className="flex gap-2 items-center justify-center"
				>
					<img
						src={Logo}
						className="max-sm:hidden w-8 md:w-12 drop-shadow-[1px_1px_1px_black]"
					/>

					<span className="text-sm md:text-2xl font-bold drop-shadow-[1px_2px_1px_black] bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary/90">
						খাবারবাড়ি
					</span>
				</Link>

				{/* RIGHT BUTTONS */}
				<div className="flex  md:justify-between max-md:hidden items-center gap-4 lg:gap-6">
					{/* DARKMODE TOGGLE */}
					<div className="w-10 drop-shadow-[2px_2px_2px_gray]">
						<DarkMode />
					</div>

					<div className="flex items-center space-x-2 md:space-x-3 xl:space-x-5 ml-3 md:ml-3 lg:ml-6 mr-2 md:mr-3 lg:mr-4">
						{/* CART BUTTON */}
						<Link
							to={"/cart"}
							className="relative text-black p-3 rounded-xl group bg-gradient-to-r from-primary to-secondary text-2xl drop-shadow-[2px_2px_2px_gray] font-semibold font-atma"
						>
							<FiShoppingCart className="text-xs md:text-sm" />
							{totalItemsCount > 0 && (
								<span className="absolute -top-3 -right-2 bg-red-500 text-white text-[8px] md:text-[14px] w-5 h-5 rounded-full inline-flex items-center justify-center">
									{toBanglaNumber(totalItemsCount)}
								</span>
							)}
						</Link>

						{user ? (
							<div className="flex gap-2">
								{/* USER BUTTON */}
								<button
									onClick={() => {
										navigate("/profile");
									}}
									className="flex items-center justify-center bg-gradient-to-r from-primary to-secondary border-none text-xs md:text-sm drop-shadow-[2px_2px_2px_gray]"
								>
									<span className="whitespace-nowrap">
										{user.name.substring(0, 15)}
									</span>
								</button>

								{/* NOTIFICATION BUTTON */}
								{isAuthenticated && <NotificationDropdown />}

								{/* LOGOUT BUTTON */}
								<button
									onClick={handleLogout}
									className="font-atma inline-block p-2 border-none rounded-xl bg-gradient-to-r from-primary to-secondary  text-xs md:text-sm font-semibold drop-shadow-[2px_2px_2px_gray]"
								>
									লগআউট
								</button>
							</div>
						) : (
							<div className="flex gap-2">
								{/* LOGIN BUTTON */}
								<Link
									to={"/login"}
									className="font-atma inline-block p-2 border-none rounded-xl bg-gradient-to-r from-primary to-secondary  text-xs md:text-sm font-semibold drop-shadow-[2px_2px_2px_gray]"
								>
									লগইন
								</Link>

								{/* REGISTER BUTTON */}
								<Link
									to={"/register"}
									className="font-atma inline-block p-2 border-none rounded-xl bg-gradient-to-r from-primary to-secondary  text-xs md:text-sm font-semibold drop-shadow-[2px_2px_2px_gray]"
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
					isAuthenticated={isAuthenticated}
					logout={handleLogout}
				/>
			)}
		</div>
	);
};

export default Navbar;
