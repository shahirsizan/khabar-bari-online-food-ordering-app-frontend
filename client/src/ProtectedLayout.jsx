import { Navigate, Outlet } from "react-router-dom";
import { useUserContext } from "./UserContext";

const ProtectedLayout = () => {
	const { isAuthenticated } = useUserContext();

	// If not authenticated, redirect to login
	return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedLayout;
