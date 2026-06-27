import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { replace, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { apiFetch } from "./utils/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const backendUrl = "http://localhost:5000";
	const { clearCart } = useCart();
	const navigate = useNavigate();
	const [isInitializing, setIsInitializing] = useState(true);
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [loading, setLoading] = useState(false);

	// console.log("is authenticated? ", isAuthenticated);

	const { pathname } = useLocation(); // Tracks the current URL path

	const verifyUser = async () => {
		const publicRoutes = ["/", "/cart"];

		const isPublicRoute = publicRoutes.includes(pathname);

		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");

		if (!token || !user) {
			setIsInitializing(false);
			// `isAuthenticated` remains false, so user gets redirected to login page,
			// or stays in the public route
			if (!isPublicRoute) {
				navigate("login");
			}
			return;
		}

		try {
			const response = await apiFetch(`${backendUrl}/api/me`, {
				method: "GET",
				headers: {
					token: JSON.parse(token),
				},
			});

			if (response.ok) {
				const user = await response.json();
				setUser(user);
				setIsAdmin(user.role === "admin");
				setIsAuthenticated(true);
			} else if (response.status === 401) {
				// console.log("navigating to /login ");
				localStorage.clear();
				setUser(null);
				setIsAuthenticated(false);
				setIsAdmin(false);

				// redirect to login on token failure if they are in a protected page
				if (!isPublicRoute) {
					// navigate("/login"); // Used navigate instead of window.location.replace for smoother routing
					window.location.replace("/login");
				}
			}
			// throw new Error("Token expired");
		} catch (error) {
			localStorage.clear();
			setUser(null);
			setIsAuthenticated(false);
			setIsAdmin(false);
			navigate("/login");
		} finally {
			setIsInitializing(false);
		}
	};

	useEffect(() => {
		// Optional: Load user data from localStorage if token exists
		// if (localStorage.getItem("user") && localStorage.getItem("token")) {
		// 	const savedUser = localStorage.getItem("user");
		// 	const user = JSON.parse(savedUser);
		// 	console.log("`user` : ", user);

		// 	setUser(user);
		// 	setIsAdmin(user.role === "admin" ? true : false);
		// 	setIsAuthenticated(true);

		// 	// console.log("savedUser: ", savedUser);
		// } else {
		// 	// Explicitly handle "not logged in" case
		// 	setUser(null);
		// 	setIsAdmin(false);
		// 	setIsAuthenticated(false);
		// }
		// setIsInitializing(false);

		verifyUser();
	}, []);

	const handleProfileInfoUpdate = async (ev, data) => {
		/***
		 * from profilePage.jsx component, function call is like below:
		 * onSubmit={(e) =>
							handleProfileInfoUpdate(e, {
							    user old object,
								userName,
								phone,
								streetAddress,
								city,
								role,
							})
						}
		 */
		ev.preventDefault();

		// 1. Retrieve the token for authorization
		const token = JSON.parse(localStorage.getItem("token"));

		try {
			// 2. Execute apiFetch() with the required header
			console.log("data: ", data);

			const response = await apiFetch(`${backendUrl}/api/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					token: token,
				},
				body: JSON.stringify(data),
			});

			// 3. Validate the response
			if (response.ok) {
				const res = await response.json();
				console.log("handleProfileInfoUpdate -> updated user: ", res);

				setUser((prevUser) => ({
					...prevUser,
					...res.user, // Merge old user data with the new returned data
				}));

				localStorage.removeItem("user");
				localStorage.setItem("user", JSON.stringify(res.user));

				// 5. Success feedback
				alert("Profile updated successfully!");
			} else if (response.status === 401) {
				logoutUser();
			} else {
				const errorData = await response.json();
				console.error(
					"handleProfileInfoUpdate() -> Failed to update: ",
					errorData.message,
				);
				alert("Profile update failed!");
			}
		} catch (error) {
			console.error(
				"handleProfileInfoUpdate() -> error: ",
				error.message,
			);
		}
	};

	const loginUser = useCallback(
		async (email, password, navigate, targetRoute) => {
			setLoading(true);

			try {
				const response = await apiFetch(`${backendUrl}/api/login`, {
					method: "POST",
					body: JSON.stringify({ email, password }),
					headers: { "Content-Type": "application/json" },
				});

				const res = await response.json();

				if (!response.ok) {
					// console.log(res.message);
					return {
						success: false,
						errorMessage: res.message || "Login failed",
					};
				} else {
					console.log("targetRoute: ", targetRoute);

					// if user has a populated cart, redirect them to cart page after login
					localStorage.setItem("token", JSON.stringify(res.token));
					localStorage.setItem("user", JSON.stringify(res.userObj));
					setUser(res.userObj);
					setIsAuthenticated(true);
					if (res.userObj?.role === "admin") {
						setIsAdmin(true);
						// console.log("is admin: ", res.userObj?.role);
					} else {
						setIsAdmin(false);
						// console.log("is admin: ", res.userObj?.role);
					}
					navigate(`${targetRoute ? targetRoute : "/"}`, {
						replace: true,
					});
					return { success: true };
				}
			} catch (error) {
				// toast.error(error.response?.data?.message || "An error occured");
				console.error(error.message);
				return {
					success: false,
					errorMessage: `Catch block: ${error.message}`,
				};
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const logoutUser = async () => {
		// Clear the casrt state in cartCOntext
		clearCart();
		// Remove the relevant storage items, keep dark mode preference
		localStorage.removeItem("token");
		localStorage.removeItem("cart");
		localStorage.removeItem("user");
		setUser(null);
		setIsAuthenticated(false);
		navigate("/login");

		// toast.success("✅ User Logged Out");
		// console.log("✅ User Logged Out");
	};

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				isAdmin,
				token,
				loading,
				isInitializing,
				isAuthenticated,
				loginUser,
				logoutUser,
				verifyUser,
				handleProfileInfoUpdate,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);
