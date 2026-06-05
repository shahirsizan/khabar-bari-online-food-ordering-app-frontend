import { Navigate } from "react-router-dom";
import { useUserContext } from "./UserContext";

const GuestRoute = ({ children }) => {
	const { isInitializing, isAuthenticated } = useUserContext();

	// If authenticated, redirect to home
	return isInitializing ? (
		<div className="h-screen flex items-center justify-center bg-yellow-500 text-black">
			Loading...
		</div>
	) : !isAuthenticated ? (
		children
	) : (
		<Navigate to="/" replace />
	);
};

export default GuestRoute;
