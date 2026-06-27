import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { apiFetch } from "../utils/api";

const RegisterPage = () => {
	const backendUrl = "http://localhost:5000";

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [phone, setPhone] = useState("");
	const [streetAddress, setStreetAddress] = useState("");
	const [city, setCity] = useState("");

	const [creatingUser, setCreatingUser] = useState(false);
	const [userCreated, setUserCreated] = useState(false);
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	async function handleFormSubmit(ev) {
		ev.preventDefault();

		setCreatingUser(true);
		setError(false);
		setUserCreated(false);

		try {
			const response = await apiFetch(`${backendUrl}/api/register`, {
				method: "POST",
				body: JSON.stringify({
					name,
					email,
					password,
					phone,
					streetAddress,
					city,
				}),
				headers: { "Content-Type": "application/json" },
			});

			const res = await response.json();
			console.log(res);

			if (!response.ok) {
				setError(true);
				setErrorMessage(res.message);
			} else {
				console.log("Registration Response: ", res);
				setUserCreated(true);
			}
		} catch (error) {
			setError(true);
			setErrorMessage(res.message);
		} finally {
			setCreatingUser(false);
		}
	}

	return (
		<div className="h-screen flex items-center justify-center text-sm md:text-lg font-atma">
			<section>
				<h1 className="text-center text-4xl mb-4 ">
					<span className="font-atma inline-block p-2 rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary text-2xl lg:text-4xl font-semibold">
						রেজিস্ট্রেশন
					</span>
				</h1>

				<form
					className="flex flex-col gap-4 max-w-xs mx-auto"
					onSubmit={handleFormSubmit}
				>
					<input
						type="text"
						placeholder="name"
						value={name}
						disabled={creatingUser}
						className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
						onChange={(ev) => setName(ev.target.value)}
					/>

					<input
						type="email"
						placeholder="email"
						value={email}
						disabled={creatingUser}
						className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
						onChange={(ev) => setEmail(ev.target.value)}
					/>

					<input
						type="password"
						placeholder="password"
						value={password}
						disabled={creatingUser}
						className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
						onChange={(ev) => setPassword(ev.target.value)}
					/>

					<input
						type="text"
						placeholder="phone"
						value={phone}
						disabled={creatingUser}
						className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
						onChange={(ev) => setPhone(ev.target.value)}
					/>

					<input
						type="text"
						placeholder="street"
						value={streetAddress}
						disabled={creatingUser}
						className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
						onChange={(ev) => setStreetAddress(ev.target.value)}
					/>

					<input
						type="text"
						placeholder="city"
						value={city}
						disabled={creatingUser}
						className={`disabled:bg-gray-200 px-3 py-2 border-2 rounded-md`}
						onChange={(ev) => setCity(ev.target.value)}
					/>

					{userCreated && (
						<div className="my-4 px-3 py-3 text-sm rounded-lg text-center border-2 shadow-lg text-white bg-green-600 ">
							আপনার একাউন্ট তৈরি হয়েছে
							<br />
							<Link className="underline" to={"/login"}>
								লগইন করতে ক্লিক করুন
							</Link>
						</div>
					)}

					{error && (
						<div className="my-4 px-3 py-3 text-sm rounded-lg text-center border-2 shadow-lg text-white bg-red-600 ">
							An error occurred!
							<br />
							{errorMessage}
							<br />
							Contact 16650 to resolve issue
						</div>
					)}

					<button
						className="border-3 bg-transparent shadow-md p-2 disabled:bg-gray-200 px-3 py-2 border-2 rounded-md"
						type="submit"
						disabled={creatingUser}
					>
						Register
					</button>

					<div className="text-center my-4 text-gray-500 border-t pt-4">
						একাউন্ট আছে?{" "}
						<Link className="underline font-semibold" to={"/login"}>
							লগইন করুন
						</Link>
					</div>
				</form>
			</section>
		</div>
	);
};

export default RegisterPage;
