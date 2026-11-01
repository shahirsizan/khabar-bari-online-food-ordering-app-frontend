import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { apiFetch, setAccessToken } from "./utils/api";
import { backend_base_url } from "./workMode";
import { initializeSocket } from "./utils/socket";
import { toast } from "react-toastify";

export interface IUserProfile {
	_id: string;
	name: string;
	email: string;
	phone?: string;
	streetAddress?: string;
	city?: string;
	role: "user" | "admin";
}

export interface NotificationItem {
	_id?: string;
	type: "chat" | "order";
	message: string;
	link?: string;
	isRead: boolean;
	createdAt: string;
}

interface UserContextType {
	user: IUserProfile | null;
	setUser: React.Dispatch<React.SetStateAction<IUserProfile | null>>;
	isAdmin: boolean;
	loading: boolean;
	isInitializing: boolean;
	isAuthenticated: boolean;
	loginUser: (
		email: string,
		password: string,
		navigate: any,
		targetRoute?: string,
	) => Promise<{ success: boolean; message?: string; errorMessage?: string }>;
	logoutUser: (reasonMessage?: string | null) => Promise<void>;
	handleProfileInfoUpdate: (
		ev: React.FormEvent,
		data: Partial<IUserProfile>,
	) => Promise<void>;
	socket: any | null;
	isAdminOnline: boolean;
	notifications: NotificationItem[];
	setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
	unreadCount: number;
	setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
	blinkNonAdminUsersChatLauncher: boolean;
	setBlinkNonAdminUsersChatLauncher: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	isChatBoxOpen: boolean;
	setIsChatBoxOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const { clearCart } = useCart();
	const navigate = useNavigate();
	const [isInitializing, setIsInitializing] = useState<boolean>(true);
	const [user, setUser] = useState<IUserProfile | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [socket, setSocket] = useState<any | null>(null);
	const [isAdminOnline, setIsAdminOnline] = useState<boolean>(false); // Tracks admin's online status
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [blinkNonAdminUsersChatLauncher, setBlinkNonAdminUsersChatLauncher] =
		useState<boolean>(false);
	/***
	 * below states are for non-admin users to track their chatbox open/close states
	 */
	const [isChatBoxOpen, setIsChatBoxOpen] = useState<boolean>(false);
	const { pathname } = useLocation(); // Tracks the current URL path

	/***
	 * Verify user session credentials everytime URL path changes
	 */
	useEffect(() => {
		const verifyUser = async () => {
			const publicRoutes: string[] = [
				"/",
				"/cart",
				"/register",
				"/login",
				"/forgot-password",
			];

			const userCurrentlyOnPublicRoute =
				publicRoutes.includes(pathname) ||
				pathname.startsWith("/reset-password-after-link");

			const user = localStorage.getItem("user");

			/***
			 * Unauthenticated user.
			 */
			if (!user) {
				setIsInitializing(false);
				/***
				 * On protected routes, redirect to /login
				 */
				if (!userCurrentlyOnPublicRoute) {
					navigate("/login");
				}
				/***
				 * On public routes, let them be.
				 */
				return;
			}

			/***
			 * Authenticated user (apparently).
			 */

			try {
				const response = await apiFetch(`${backend_base_url}/api/me`, {
					method: "GET",
				});

				/***
				 * Valid session, set the relevant data.
				 */
				if (response.ok) {
					const user = await response.json();
					setUser(user);
					setIsAdmin(user.role === "admin");
					setIsAuthenticated(true);
				} else {
					/***
					 * Invalid session, unset the relevant data.
					 */
					localStorage.clear();
					setUser(null);
					setIsAdmin(false);
					setIsAuthenticated(false);

					if (!userCurrentlyOnPublicRoute) {
						/***
						 * Use window.location.replace() for security redirects, such as knocking a user
						 * out to a login screen when their session expires or after they click "Log Out."
						 * This ensures they cannot navigate back into protected, private routes.
						 */
						toast.warn("পুনরায় লগইন করুন");
						window.location.replace("/login");
					}
				}
			} catch (error: any) {
				if (error.message === "429") {
					/***
					 * Rate limiting error. No need to logout,
					 * just make them wait.
					 */
					return;
				}
				localStorage.clear();
				setUser(null);
				setIsAuthenticated(false);
				setIsAdmin(false);
				navigate("/login");
				toast.warn("পুনরায় লগইন করুন");
			} finally {
				setIsInitializing(false);
			}
		};

		verifyUser();
		// Fires routing validation on navigation change.
		// This ensures that if a user manually navigates to a protected route,
		// the app checks their authentication status and redirects them if necessary.
	}, [pathname]);

	/***
	 * Initialize socket (on mount)
	 */
	useEffect(() => {
		const socketInstance = initializeSocket();
		setSocket(socketInstance);

		// Cleanup socket connection when component unmounts
		return () => {
			if (socketInstance) {
				socketInstance.disconnect();
			}
		};
	}, [user]);

	/***
	 * Handle presence registration, room joining, and automatic reconnections.
	 * `join-room` emission for non-admin users will occur here.
	 * For admin, it will occur from `chatBox.jsx` when the admin selects a specific room from the sidebar.
	 */
	useEffect(() => {
		if (!socket || !user) {
			return;
		}

		// Function to run on initial connect and every reconnection
		const handleConnect = () => {
			// Declare presence to server
			socket.emit("register_presence", { user });

			if (user.role === "admin") {
				// Admin joins the global admin room
				socket.emit("join_room", { roomId: "admin_room" });
			} else {
				// Non-admin users join their individual room
				socket.emit("join_room", { roomId: user._id });
			}
		};

		// If socket is already connected when this effect runs, trigger immediately
		if (socket.connected) {
			handleConnect();
		}

		// Listen for connection drops and automatic reconnections
		socket.on("connect", handleConnect);

		return () => {
			socket.off("connect", handleConnect);
		};
	}, [user, socket]);

	/***
	 * For non-admin users to check whether admin is online (on mount).
	 */
	useEffect(() => {
		if (!socket || !user || user.role === "admin") {
			return;
		}

		const checkAdmin = () => {
			socket.emit("check_admin_status");
		};

		// Check on initial load and reconnects
		if (socket.connected) {
			checkAdmin();
		}
		socket.on("connect", checkAdmin);

		const handleAdminStatus = ({ status }: { status: string }) => {
			setIsAdminOnline(status === "online");
		};

		socket.on("admin_status", handleAdminStatus);

		return () => {
			socket.off("connect", checkAdmin);
			socket.off("admin_status", handleAdminStatus);
		};
	}, [user, socket]);

	/***
	 * Fetch historical notifications from DB (on mount).
	 */
	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/notifications`,
				);

				if (response.ok) {
					const res = await response.json();
					setNotifications(res);
					setUnreadCount(
						res.filter((noti: NotificationItem) => !noti.isRead)
							.length,
					);
				}
			} catch (error: any) {
				console.error("error -> fetchNotifications: ", error.message);
			}
		};

		if (isAuthenticated) {
			fetchNotifications();
		}
	}, [isAuthenticated]);

	/***
	 * Set up event listeners for `chat` & `order`
	 * notifications (on mount).
	 */
	useEffect(() => {
		if (!socket || !user) {
			return;
		}

		const handleNewNotification = (notification: NotificationItem) => {
			if (notification.type === "chat") {
				if (user.role === "user") {
					/***
					 * New notification from `admin`.
					 * Blink non-admin users chat launcher.
					 */
					setBlinkNonAdminUsersChatLauncher(true);
				}

				/***
				 * Group chat notifications by same link (roomId) if unread
				 */
				setNotifications((prev) => {
					/***
					 * here, prev = [n, n, n, n, n....]
					 */
					const prevUnreadNotiIndex = prev.findIndex(
						(n) =>
							!n.isRead &&
							n.type === "chat" &&
							n.link === notification.link,
					);

					if (prevUnreadNotiIndex !== -1) {
						const existingNotificationList = [...prev];
						existingNotificationList[prevUnreadNotiIndex] = {
							...existingNotificationList[prevUnreadNotiIndex],
							message: notification.message,
							createdAt: notification.createdAt,
						};
						/***
						 * Move the updated notification to top
						 */
						const [updatedNotification] =
							existingNotificationList.splice(
								prevUnreadNotiIndex,
								1,
							);
						return [
							updatedNotification,
							...existingNotificationList,
						];
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

	/***
	 * Update profile
	 */
	const handleProfileInfoUpdate = async (
		ev: React.FormEvent,
		data: Partial<IUserProfile>,
	): Promise<void> => {
		/***
		 * from `profilePage.jsx` component, function call is like below:
		 * onSubmit={(e) =>
							handleProfileInfoUpdate(e, {
								user old object: user,
								userName,
								phone,
								streetAddress,
								city,
								role,
							})
						}
		 */

		ev.preventDefault();

		try {
			// console.log("data: ", data);
			const response = await apiFetch(`${backend_base_url}/api/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			// 3. Validate the response
			if (response.ok) {
				const res = await response.json();
				// console.log("handleProfileInfoUpdate -> updated user: ", res);

				setUser((prevUser) => ({
					// prevUser could theoritically be `null` because it was initialized with `null`.
					...(prevUser || {}),
					...res.user, // Merge old user data with the new returned data
				}));

				localStorage.removeItem("user");
				localStorage.setItem("user", JSON.stringify(res.user));

				toast.success("প্রোফাইল আপডেট প্রক্রিয়া সফল হয়েছে");
			} else if (response.status === 401) {
				await logoutUser();
			} else {
				const errorData = await response.json();
				console.error(
					"handleProfileInfoUpdate() -> Failed to update: ",
					errorData.message,
				);
				alert("প্রোফাইল আপডেট প্রক্রিয়া ব্যর্থ হয়েছে!");
			}
		} catch (error: any) {
			console.error(
				"handleProfileInfoUpdate() -> error: ",
				error.message,
			);
		}
	};

	/***
	 * Login user
	 */
	const loginUser = useCallback(
		async (email: string, password: string, targetRoute?: string) => {
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
						message: res.message || "লগইন প্রক্রিয়া ব্যর্থ হয়েছে",
					};
				}

				/***
				 * After logging in, set access token in an in-memory variable.
				 * Refresh token is set in the cookie by the server.
				 */
				setAccessToken(res.accessToken);

				// if user has a populated cart, redirect them to cart page after login
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
			} catch (error: any) {
				console.error(error.message);
				return {
					success: false,
					errorMessage: `লগইন প্রক্রিয়া ব্যর্থ হয়েছে`,
				};
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	/***
	 * Logout user
	 * */
	const logoutUser = async (
		reasonMessage: string | null = null,
	): Promise<void> => {
		try {
			/***
			 * Instruct backend to clear httpOnly cookie
			 */
			await apiFetch(`${backend_base_url}/api/logout`, {
				method: "POST",
			});
		} catch (error: any) {
			console.error("Backend logout failed: ", error.message);
		} finally {
			/***
			 * Perform local cleanup regardless of network success/failure
			 */
			clearCart();
			setAccessToken(null);
			localStorage.removeItem("cart");
			localStorage.removeItem("user");
			setUser(null);
			setIsAuthenticated(false);
			setIsAdmin(false);

			if (reasonMessage) {
				toast.warn(reasonMessage);
			} else {
				toast.success("লগআউট সফল হয়েছে");
			}

			navigate("/login", { replace: true });
		}
	};

	/***
	 * Set up listeners for `session expiry` event
	 * dispatched from apiFetch utility.
	 */
	useEffect(() => {
		const handleSessionExpired = () => {
			logoutUser("এক্সেস টোকেন এবং রিফ্রেশ টোকেন ইনভ্যালিডেটেড");
		};

		window.addEventListener("auth-session-expired", handleSessionExpired);

		return () => {
			window.removeEventListener(
				"auth-session-expired",
				handleSessionExpired,
			);
		};
	}, []);

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
				isAdmin,
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

export const useUserContext = (): UserContextType => {
	const context = useContext(UserContext);

	if (!context) {
		throw new Error(
			"🚨 useUserContext hook error: This element must live inside a valid UserProvider container hierarchy.",
		);
	}

	return context;
};
