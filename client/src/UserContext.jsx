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
import { toast } from "react-toastify";

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
	const [blinkNonAdminUsersChatLauncher, setBlinkNonAdminUsersChatLauncher] =
		useState(false);
	/***
	 * below states are for non-admin users to track their chatbox open/close states
	 */
	const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);

	// Verify user auth state everytime URL path changes
	useEffect(() => {
		const verifyUser = async () => {
			const publicRoutes = [
				"/",
				"/cart",
				"/register",
				"/login",
				"/forgot-password",
			];

			const userCurrentlyOnPublicRoute =
				publicRoutes.includes(pathname) ||
				pathname.startsWith("/reset-password-after-link");

			const token = localStorage.getItem("token");
			const user = localStorage.getItem("user");

			if (!token || !user) {
				setIsInitializing(false);
				if (!userCurrentlyOnPublicRoute) {
					// no `token`, no `user obj`, also currently on private route, so redirect to "/login.
					// Else let them stay on the public routes"
					navigate("/login");
				}
				return;
			}

			// User has auth(unverified) tokens and on protected routes.
			// So verify them.
			try {
				const response = await apiFetch(`${backend_base_url}/api/me`, {
					method: "GET",
					headers: {
						token: JSON.parse(token),
					},
				});

				if (response.ok) {
					// Authenticated user
					const user = await response.json();
					setUser(user);
					setIsAdmin(user.role === "admin");
					setIsAuthenticated(true);
				} else {
					// Unauthenticated user
					localStorage.clear();
					setUser(null);
					setIsAdmin(false);
					setIsAuthenticated(false);

					// redirect to `login` if they are in protected route
					if (!userCurrentlyOnPublicRoute) {
						/***
						 * Use window.location.replace() for security redirects, such as knocking a user
						 * out to a login screen when their session expires or after they click "Log Out."
						 * This ensures they cannot navigate back into protected, private routes.
						 */
						toast.warn(
							"Authentication check failed. Please log in again.",
						);
						window.location.replace("/login");
					}
				}
			} catch (error) {
				localStorage.clear();
				setUser(null);
				setIsAuthenticated(false);
				setIsAdmin(false);
				navigate("/login");
				toast.warn("Authentication check failed. Please log in again.");
			} finally {
				setIsInitializing(false);
			}
		};

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
			if (notification.type === "chat") {
				/***
				 * If chat notification
				 */
				if (user.role === "user") {
					/***
					 * Notification came from `admin`.
					 * So blink the non-admin users chat launcher.
					 */
					setBlinkNonAdminUsersChatLauncher(true);
				}

				/***
				 * Group chat notifications by same link (roomId) if unread
				 */
				setNotifications((prev) => {
					/***
					 * here,prev = [notification, notification, notification....]
					 */
					const existingIdx = prev.findIndex(
						(n) =>
							n.type === "chat" &&
							n.link === notification.link &&
							!n.isRead,
					);

					if (existingIdx !== -1) {
						const existingNotificationList = [...prev];
						existingNotificationList[existingIdx] = {
							...existingNotificationList[existingIdx],
							message: notification.message,
							createdAt: notification.createdAt,
						};
						/***
						 * Move the updated notification to top
						 */
						const [item] = existingNotificationList.splice(
							existingIdx,
							1,
						);
						return [item, ...existingNotificationList];
					}

					/***
					 * For brand new notification (chat | order),
					 * update unread count and
					 * append it to the list
					 */
					setUnreadCount((count) => count + 1);
					return [notification, ...prev];
				});
			} else {
				/***
				 * If order related notifications for both type of users,
				 * just append them to the notification window
				 */
				setNotifications((prev) => [notification, ...prev]);
				setUnreadCount((prev) => prev + 1);
			}
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
			// console.log("data: ", data);

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
				// console.log("handleProfileInfoUpdate -> updated user: ", res);

				setUser((prevUser) => ({
					...prevUser,
					...res.user, // Merge old user data with the new returned data
				}));

				localStorage.removeItem("user");
				localStorage.setItem("user", JSON.stringify(res.user));

				toast.success("আপনার প্রোফাইল আপডেট হয়েছে।");
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
					return {
						success: false,
						message: res.message || "Login failed",
					};
				} else {
					// console.log("targetRoute: ", targetRoute);

					// if user has a populated cart, redirect them to cart page after login
					localStorage.setItem("token", JSON.stringify(res.token));
					localStorage.setItem("user", JSON.stringify(res.userObj));
					setUser(res.userObj);
					setIsAuthenticated(true);
					if (res.userObj?.role === "admin") {
						setIsAdmin(true);
					} else {
						setIsAdmin(false);
					}
					navigate(targetRoute || "/", {
						replace: true,
					});
					return { success: true, message: res.message };
				}
			} catch (error) {
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
		toast.success("Logged Out");
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
				handleProfileInfoUpdate,
				socket,
				isAdminOnline,
				notifications,
				setNotifications,
				unreadCount,
				setUnreadCount,
				blinkNonAdminUsersChatLauncher,
				setBlinkNonAdminUsersChatLauncher,
				isChatBoxOpen,
				setIsChatBoxOpen,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);
