import { Navigate } from "react-router-dom";
import { useUserContext } from "./UserContext";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated } = useUserContext();

	// If not authenticated, redirect to login
	return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
