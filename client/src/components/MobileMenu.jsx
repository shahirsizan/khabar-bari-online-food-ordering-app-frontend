import { useEffect } from "react";
import { Link } from "react-router-dom";
import DarkMode from "./Navbar/DarkMode";
import { FiShoppingCart } from "react-icons/fi";
import { toBanglaNumber } from "../utils/toBanglaNumber";

const MobileMenu = ({ isOpen, onClose, user, totalItemsCount, logout }) => {
	// Prevent scrolling when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<div className="fixed inset-0 z-50 text-lg">
			{/* BACKDROP */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* SIDEBAR */}
			<div className="dark:text-white text-black relative w-2/3 h-full bg-white dark:bg-gray-800 shadow-2xl p-4 flex flex-col gap-4 animate-in slide-in-from-right duration-700">
				<button
					onClick={onClose}
					className="dark:text-white text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center"
				>
					✕
				</button>

				<nav className="flex flex-col gap-3 mt-8 text-lg">
					<DarkMode />

					<button className="dark:text-white text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center">
						<Link to="/" onClick={onClose} className="">
							Home
						</Link>
					</button>

					<button className="text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center">
						<Link
							to={"/cart"}
							className=" p-2 rounded-xl relative group shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary  text-2xl font-semibold"
						>
							<FiShoppingCart className="text-base md:text-lg lg:text-lg" />
							{totalItemsCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-amber-600 text-lg w-5 h5 rounded-full flex items-center justify-center">
									{toBanglaNumber(totalItemsCount)}
								</span>
							)}
						</Link>
					</button>

					{user ? (
						<>
							{/* USER LOGGED IN */}
							<button className="dark:text-white text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center">
								<Link
									to="/profile"
									onClick={onClose}
									className=""
								>
									{user.name}
								</Link>
							</button>

							<button
								onClick={() => {
									logout();
									onClose();
								}}
								className="dark:text-white text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center"
							>
								Logout
							</button>
						</>
					) : (
						<>
							{/* USER NOT LOGGED IN */}
							<button className="dark:text-white text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center">
								<Link
									to="/login"
									onClick={onClose}
									className="text-xl"
								>
									Login
								</Link>
							</button>

							<button className="dark:text-white text-black w-full relative shadow-xl border cursor-pointer overflow-hidden h-16 flex items-center justify-center">
								<Link
									to="/register"
									onClick={onClose}
									className="text-xl"
								>
									Register
								</Link>
							</button>
						</>
					)}
				</nav>
			</div>
		</div>
	);
};

export default MobileMenu;
