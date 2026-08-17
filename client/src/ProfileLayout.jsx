import React from "react";
import { useUserContext } from "./UserContext";
import { NavLink, Outlet } from "react-router-dom";

const ProfileLayout = () => {
	const { isAdmin } = useUserContext();

	const allTabs = [
		{ label: "Profile", path: "/profile" },
		{ label: "Menu Items", adminOnly: true, path: "/profile/menu-items" },
		{ label: "Users", adminOnly: true, path: "/profile/users" },
		{ label: "Chats", adminOnly: true, path: "/profile/chats" },
		{ label: "Orders", path: "/profile/orders" },
	];

	// hide non-admin tabs for `non-admin` users
	const visibleTabs = allTabs.filter((tab) => !tab.adminOnly || isAdmin);

	return (
		<div className="PROFILELAYOUT pt-10 px-[5vw] md:px-[8vw] lg:px-[10vw]">
			<div className="flex justify-center mb-8">
				<nav className="PROFILE-TABS flex items-center gap-1 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-xl font-atma border border-gray-200/50 shadow-inner flex-wrap justify-center max-w-max">
					{visibleTabs.map((tab) => (
						<NavLink
							key={tab.path}
							to={tab.path}
							/** DOC:
									 Changes the matching logic for the `active` and `pending` states to only match to the "end" of the {@link NavLinkProps.to}. If the URL is longer, it will no longer be considered active.
								
									| Link                          | URL          | isActive |
									| ----------------------------- | ------------ | -------- |
									| `<NavLink to="/tasks" />`     | `/tasks`     | true     |
									| `<NavLink to="/tasks" />`     | `/tasks/123` | true     |
									| `<NavLink to="/tasks" end />` | `/tasks`     | true     |
									| `<NavLink to="/tasks" end />` | `/tasks/123` | false    |
								
									`<NavLink to="/">` is an exceptional case because _every_ URL matches `/`. To avoid this matching every single route by default, it effectively ignores the `end` prop and only matches when you're at the root route.
									*/
							end={tab.path === "/profile" ? true : false} // Prevents partial matches on sub-routes
							className={({ isActive }) =>
								`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ease-out select-none whitespace-nowrap
								${
									isActive
										? "bg-white text-red-700 shadow-sm border border-gray-200/30"
										: "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
								}`
							}
						>
							{tab.label}
						</NavLink>
					))}
				</nav>
			</div>

			{/* Sub-page Content Area */}
			<div className="mt-4">
				<Outlet />
			</div>
		</div>
	);
};

export default ProfileLayout;
