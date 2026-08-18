import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserContext } from "./UserContext";

const GuestRoute = ({ children }) => {
	const { isInitializing, isAuthenticated } = useUserContext();
	/***
	 * Check React Router's `location` state. If a dynamic redirect state exists,
	 * send the user there instead of "/"
	 */
	const location = useLocation();
	const fallbackRedirect = location.state?.from || "/";

	// If authenticated, redirect to home
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
