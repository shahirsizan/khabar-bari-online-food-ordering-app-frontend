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
import { backend_base_url } from "./workMode";
import { initializeSocket } from "./utils/socket";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const { clearCart } = useCart();
	const navigate = useNavigate();
	const [isInitializing, setIsInitializing] = useState(true);
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [loading, setLoading] = useState(false);
	const [socket, setSocket] = useState(null);
	const [isAdminOnline, setIsAdminOnline] = useState(false); // Tracks admin's online status
	const { pathname } = useLocation(); // Tracks the current URL path
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);

	const verifyUser = async () => {
		const publicRoutes = [
			"/",
			"/cart",
			"/register",
			"/login",
			"/forgot-password",
		];

		const isPublicRoute =
			publicRoutes.includes(pathname) ||
			pathname.startsWith("/reset-password-after-link");

		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");

		if (!token || !user) {
			setIsInitializing(false);
			// `isAuthenticated` remains false, so user gets redirected to login page,
			// or stays in the public route
			if (!isPublicRoute) {
				navigate("/login");
			}
			return;
		}

		try {
			const response = await apiFetch(`${backend_base_url}/api/me`, {
				method: "GET",
				headers: {
					token: JSON.parse(token),
				},
			});

			if (response.ok) {
				const user = await response.json();
				setUser(user);
				// console.log("user obj: ", user);

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
		verifyUser();
		// Fires routing validation on navigation change.
		// This ensures that if a user manually navigates to a protected route,
		// the app checks their authentication status and redirects them if necessary.
	}, [pathname]);

	// create socket instance on mount
	useEffect(() => {
		const socketInstance = initializeSocket();
		setSocket(socketInstance);
	}, [user]);

	// join-room emit for non-admin users will occur from below
	// but for admin, it will occur from chatBox.jsx when the admin selects a specific room from the sidebar.
	useEffect(() => {
		if (!socket || !user) {
			return;
		}

		// Declare presence to server upon app mount
		socket.emit("register_presence", { user });

		if (user.role === "admin") {
			// Admin joins the global admin_room for realtime order alerts
			socket.emit("join_room", { roomId: "admin_room" });
		} else {
			// Non-admin users join their individual room based on their unique database ID
			socket.emit("join_room", { roomId: user._id });
		}
	}, [user, socket]);

	// for non-admin users to check whether admin is online (on mount).
	useEffect(() => {
		if (!socket || !user || user.role === "admin") {
			return;
		}

		socket.emit("check_admin_status");

		// 1. Define a named handler to isolate the reference
		const handleAdminStatus = ({ status }) => {
			setIsAdminOnline(status === "online");
		};

		socket.on("admin_status", handleAdminStatus);

		return () => {
			socket.off("admin_status", handleAdminStatus);
		};
	}, [user, socket]);

	// fetch historical notifications from DB (on mount).
	const fetchNotifications = async () => {
		if (!user) {
			return;
		}

		try {
			const response = await apiFetch(
				`${backend_base_url}/api/notifications`,
				{
					headers: {
						token: JSON.parse(localStorage.getItem("token")),
					},
				},
			);
			if (response.ok) {
				const res = await response.json();
				setNotifications(res);
				setUnreadCount(res.filter((noti) => !noti.isRead).length);
			}
		} catch (error) {
			console.error("error -> fetchNotifications: ", error.message);
		}
	};

	// ⬆️ call above method (on mount).
	useEffect(() => {
		if (isAuthenticated) {
			fetchNotifications();
		}
	}, [isAuthenticated]);

	// Listen for `chat` &  `order update` notifications (on mount).
	useEffect(() => {
		if (!socket || !user) {
			return;
		}

		const handleNewNotification = (notification) => {
			console.log("New notification received:", notification); // Debug log
			setNotifications((prev) => [notification, ...prev]);
			setUnreadCount((prev) => prev + 1);
		};

		socket.on("new_chat_notification", handleNewNotification);
		socket.on("order_status_updated", handleNewNotification);
		socket.on("new_order_placed", handleNewNotification);

		return () => {
			socket.off("new_chat_notification", handleNewNotification);
			socket.off("order_status_updated", handleNewNotification);
			socket.off("new_order_placed", handleNewNotification);
		};
	}, [socket, user]);

	/***
	 * next day te chat notification niye kaj korte hobe.
	 * order notification apatoto basic level e kaj kortese.
	 * 		`new_order_placed` & `order_status_updated` event duitar jonno proper notification trigger hocche.
	 * But chat er ta kaj kortese na.
	 */

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

			const response = await apiFetch(`${backend_base_url}/api/profile`, {
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
				const response = await apiFetch(
					`${backend_base_url}/api/login`,
					{
						method: "POST",
						body: JSON.stringify({ email, password }),
						headers: { "Content-Type": "application/json" },
					},
				);

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
		setToken(null);
		setIsAuthenticated(false);
		setIsAdmin(false);
		navigate("/login", { replace: true });

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
				socket,
				isAdminOnline,
				notifications,
				setNotifications,
				unreadCount,
				setUnreadCount,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);
