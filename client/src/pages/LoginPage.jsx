import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useUserContext } from "../UserContext";

const LoginPage = () => {
	const backendUrl = "http://localhost:5000";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navigate = useNavigate();

	const { loading, loginUser } = useUserContext();

	async function handleLogin(ev) {
		ev.preventDefault();
		loginUser(email, password, navigate);

		// setLogginInUser(true);
		// setError(false);
		// setUserLoggedIn(false);

		// try {
		// 	const response = await fetch(`${backendUrl}/api/login`, {
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
				<div className="h-screen flex items-center justify-center">
					<section>
						<h1 className="text-center text-4xl mb-4 ">
							<span className="font-atma inline-block p-2 rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary text-2xl lg:text-4xl font-semibold">
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
								className="border-3 bg-transparent shadow-md p-2"
								type="submit"
								disabled={loading}
								className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
							>
								Login
							</button>

							<button
								onClick={() =>
									signIn("google", { callbackUrl: "/" })
								}
								className="flex items-center justify-center gap-2 p-2 border-3 bg-transparent shadow-md"
							>
								<FaGoogle />
								Login with Google
							</button>

							<div className="text-center my-4 text-gray-500 border-t pt-4">
								Don't have an account?{" "}
								<Link className="underline" to={"/register"}>
									Register
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
