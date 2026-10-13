import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserContext } from "./UserContext";
import { ReactNode } from "react";

interface LocationState {
	from?: string;
}

const GuestRoute: React.FC<{ children?: ReactNode }> = () => {
	const { isInitializing, isAuthenticated } = useUserContext();
	/***
	 * Check React Router's `location` state. If a dynamic redirect state exists,
	 * send the user there instead of "/"
	 */
	const location = useLocation();
	const state = location.state as LocationState;
	const fallbackRedirect = state?.from || "/";

	/***
	 * 1. If loading, show loading screen
	 * After loaded:
	 * 2. If unauthenticated, allow access only to the guest screens
	 * 3. If authenticated, redirect away to the `fallbackRedirect` path (no access to routes dedicated for unauth users)
	 */
	return isInitializing ? (
		<div className="h-screen flex items-center justify-center bg-yellow-500 text-black font-atma">
			Loading...
		</div>
	) : !isAuthenticated ? (
		<Outlet />
	) : (
		<Navigate to={fallbackRedirect} replace />
	);
};

export default GuestRoute;
