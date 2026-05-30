import { Navigate } from "react-router-dom";
import { useUserContext } from "./UserContext";

const GuestRoute = ({ children }) => {
	const { isAuthenticated } = useUserContext();

	// If authenticated, redirect to home
	return !isAuthenticated ? children : <Navigate to="/" replace />;
};

export default GuestRoute;
