import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "./UserContext";

const ProtectedLayout = () => {
	const { isInitializing, isAuthenticated } = useUserContext();

	// If not authenticated, redirect to login
	return isInitializing ? (
		<div className="h-screen flex items-center justify-center text-4xl bg-yellow-500 text-black">
			Loading...
		</div>
	) : isAuthenticated ? (
		<Outlet />
	) : (
		<Navigate to="/login" replace />
	);
};

export default ProtectedLayout;
