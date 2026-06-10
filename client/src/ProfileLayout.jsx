import React from "react";
import { useUserContext } from "./UserContext";
import { Link, Outlet, useLocation } from "react-router-dom";

const ProfileLayout = () => {
	const location = useLocation();
	const { user, isAdmin } = useUserContext();

	return (
		<div className="PROFILELAYOUT">
			<div className="tabs flex mx-auto gap-2 tabs justify-center flex-wrap">
				<Link to={"/profile"}>
					<span
						className={
							location.pathname === "/profile"
								? "text-red-600 font-bold"
								: "text-gray-500 font-bold"
						}
					>
						Profile
					</span>
				</Link>

				{isAdmin && (
					<>
						<Link to={"menu-items"}>
							<span
								className={
									location.pathname === "/profile/menu-items"
										? "text-red-600 font-bold"
										: "text-gray-500 font-bold"
								}
							>
								Menu Items
							</span>
						</Link>
						<Link to={"users"}>
							<span
								className={
									location.pathname === "/profile/users"
										? "text-red-600 font-bold"
										: "text-gray-500 font-bold"
								}
							>
								Users
							</span>
						</Link>
					</>
				)}

				<Link
					// className={path === "/orders" ? "active" : ""}
					to={"orders"}
				>
					<span
						className={
							location.pathname === "/profile/orders"
								? "text-red-600 font-bold"
								: "text-gray-500 font-bold"
						}
					>
						Orders
					</span>
				</Link>
			</div>

			<div className="">
				<Outlet />
			</div>
		</div>
	);
};

export default ProfileLayout;
