import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
	const backendUrl = "http://localhost:5000";
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [token, setToken] = useState(localStorage.getItem("token") || null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		// Optional: Load user data from localStorage if token exists
		const savedUser = localStorage.getItem("user");
		if (savedUser) {
			setUser(JSON.parse(savedUser));
			setIsAuthenticated(true);
			console.log("savedUser: ", savedUser);
		}
	}, []);

	console.log("is authenticated? ", isAuthenticated);

	// const loginUser = (userData, userToken) => {
	// 	setUser(userData);
	// 	setToken(userToken);
	// 	localStorage.setItem("token", userToken);
	// 	localStorage.setItem("user", JSON.stringify(userData));
	// };

	// const logoutUser = () => {
	// 	setUser(null);
	// 	setToken(null);
	// 	localStorage.removeItem("token");
	// 	localStorage.removeItem("user");
	// };

	//
	// ✅
	// const registerUser = useCallback(
	// 	async (name, email, password, navigate) => {
	// 		setBtnLoading(true);

	// 		try {
	// 			const { data } = await axios.post(
	// 				`${userServer}/api/v1/user/register`,
	// 				{
	// 					name,
	// 					email,
	// 					password,
	// 				},
	// 			);

	// 			toast.success(data.message);
	// 			localStorage.setItem("token", data.token);
	// 			setUser(data.user);
	// 			setIsAuthenticated(true);
	// 			navigate("/");
	// 		} catch (error) {
	// 			toast.error(
	// 				error.response?.data?.message || "An error occured",
	// 			);
	// 		} finally {
	// 			setBtnLoading(false);
	// 		}
	// 	},
	// 	[],
	// );

	// ✅
	const loginUser = useCallback(async (email, password, navigate) => {
		setLoading(true);

		try {
			const response = await fetch(`${backendUrl}/api/login`, {
				method: "POST",
				body: JSON.stringify({ email, password }),
				headers: { "Content-Type": "application/json" },
			});

			const res = await response.json();
			console.log("loginUser -> res: ", res);

			if (!response.ok) {
				console.log(res.message);
			} else {
				localStorage.setItem("token", JSON.stringify(res.token));
				localStorage.setItem("user", JSON.stringify(res.userObj));
				setUser(res.userObj);
				// console.log("loginUser() -> data.userObj: ", data.userObj);
				setIsAuthenticated(true);
				// console.log("✅ Logged in successfully");
				// toast.success(res);
				navigate("/");
			}
		} catch (error) {
			// toast.error(error.response?.data?.message || "An error occured");
			console.log(error);
		} finally {
			setLoading(false);
		}
	}, []);

	// ✅
	const logoutUser = async () => {
		// localStorage.removeItem("token"); will also work. But we prefer erasing every info about the user
		localStorage.clear();
		setUser(null);
		setIsAuthenticated(false);
		navigate("/login");

		// toast.success("✅ User Logged Out");
		console.log("✅ User Logged Out");
	};

	//

	return (
		<UserContext.Provider
			value={{
				user,
				token,
				loading,
				isAuthenticated,
				loginUser,
				logoutUser,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

export const useUserContext = () => useContext(UserContext);
