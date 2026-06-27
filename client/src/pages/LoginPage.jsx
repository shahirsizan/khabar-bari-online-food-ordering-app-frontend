import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useUserContext } from "../UserContext";

const LoginPage = () => {
	const { loading, loginUser } = useUserContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, seteErrorMessage] = useState(null);
	const navigate = useNavigate();
	// get the `state` object which containt the route where to navigate after login
	// this is needed because we might need to navigate to `/cart` route if non-auth user already has a populated cart.
	const location = useLocation();
	const targetRoute = location.state?.from || "/";

	async function handleLogin(ev) {
		ev.preventDefault();
		const response = await loginUser(
			email,
			password,
			navigate,
			targetRoute,
		);

		if (!response.success) {
			console.log(response.errorMessage);

			seteErrorMessage(response.errorMessage);
		}

		// setLogginInUser(true);
		// setError(false);
		// setUserLoggedIn(false);

		// try {
		// 	const response = await apiFetch(`${backendUrl}/api/login`, {
		// 		method: "POST",
		// 		body: JSON.stringify({ email, password }),
		// 		headers: { "Content-Type": "application/json" },
		// 	});

		// 	const res = await response.json();
		// 	console.log(res);

		// 	if (!response.ok) {
		// 		setError(true);
		// 		setErrorMessage(res.message);
		// 	} else {
		// 		console.log("Login Response: ", res);
		// 		setUserLoggedIn(true);
		// 		navigate("/");
		// 	}
		// } catch (error) {
		// 	setError(true);
		// 	setErrorMessage(res.message);
		// } finally {
		// 	setLogginInUser(false);
		// }
	}

	return (
		<>
			{loading ? (
				<div>loading...</div>
			) : (
				<div className="h-screen flex items-center justify-center text-sm md:text-lg font-atma">
					<section>
						<h1 className="text-center text-4xl mb-4 ">
							<span className="inline-block p-2 rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary text-xl lg:text-3xl font-semibold">
								লগইন
							</span>
						</h1>

						<form
							className="flex flex-col gap-4 max-w-xs mx-auto"
							onSubmit={handleLogin}
						>
							<input
								type="email"
								placeholder="email"
								value={email}
								disabled={loading}
								className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
								onChange={(ev) => setEmail(ev.target.value)}
							/>

							<input
								type="password"
								placeholder="password"
								value={password}
								disabled={loading}
								className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
								onChange={(ev) => setPassword(ev.target.value)}
							/>

							<button
								className="border-3 bg-transparent shadow-md font-semibold p-2 disabled:bg-gray-200 px-3 py-2 border-2 rounded-md"
								type="submit"
								disabled={loading}
							>
								লগইন
							</button>

							{errorMessage && (
								<div className="my-4 px-3 py-3 text-sm rounded-lg text-center border-2 shadow-lg text-white bg-red-700 ">
									Error occured!
									<br />
									{errorMessage}
								</div>
							)}

							<div className="text-center my-4 text-gray-500 border-t pt-4">
								একাউন্ট নেই?{" "}
								<Link
									className="underline font-semibold"
									to={"/register"}
								>
									রেজিস্টার করুন
								</Link>
							</div>
						</form>
					</section>
				</div>
			)}
		</>
	);
};

export default LoginPage;
