import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useUserContext } from "../UserContext";

const EditUserPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [shouldBeDisabled, setShouldBeDisabled] = useState(true);
	const [otherUser, setOtherUser] = useState(null);
	const { user, setUser } = useUserContext();

	const [userName, setUserName] = useState(otherUser?.name || "");
	const [phone, setPhone] = useState(otherUser?.phone || "");
	const [streetAddress, setStreetAddress] = useState(
		otherUser?.streetAddress || "",
	);
	const [city, setCity] = useState(otherUser?.city || "");
	const [role, setRole] = useState(otherUser?.role || "");

	useEffect(() => {
		const fetchUser = async () => {
			try {
				const response = await fetch(
					`http://localhost:5000/api/users/${id}`,
					{
						method: "GET",
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const data = await response.json();
					console.log("`user` : ", user);
					console.log("`otherUser` : ", data);
					setOtherUser(data);

					if (data.email === user.email) {
						setShouldBeDisabled(false);
					}

					setUserName(data.name || "");
					setPhone(data.phone || "");
					setStreetAddress(data.streetAddress || "");
					setCity(data.city || "");
					setRole(data.role || "");
				}
			} catch (err) {
				console.error("Fetch failed: ", err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, [id]);

	const handleSaveButtonClick = async (ev, data) => {
		ev.preventDefault();

		try {
			const response = await fetch(`http://localhost:5000/api/profile`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					token: JSON.parse(localStorage.getItem("token")),
				},
				body: JSON.stringify(data),
			});

			// 2. If response is NOT ok, throw an error.
			// This automatically triggers the "error" state in toast.promise
			// if (!response.ok) {
			// 	throw new Error("Failed to save");
			// }

			// 3. Validate the response
			if (response.ok) {
				const res = await response.json();
				// console.log("handleProfileInfoUpdate -> updated user: ", res);

				if (res.user.email === user.email) {
					setUser((prevUser) => ({
						...prevUser,
						...res.user, // Merge old user data with the new returned data
					}));
					localStorage.removeItem("user");
					localStorage.setItem("user", JSON.stringify(res.user));
				} else {
					setOtherUser((prevUser) => ({
						...prevUser,
						...res.user, // Merge old user data with the new returned data
					}));
				}

				// 5. Success feedback
				alert("Profile updated successfully!");
			} else {
				const errorData = await response.json();
				console.error(
					"handleProfileInfoUpdate() -> Failed to update: ",
					errorData.message,
				);
				alert("Profile update failed!");
			}
		} catch (error) {
			console.error("Failed to update user: ", error.message);
		}
	};

	function handleAddressChange(propName, value) {
		if (propName === "name") {
			setUserName(value);
		}
		if (propName === "phone") {
			setPhone(value);
		}
		if (propName === "streetAddress") {
			setStreetAddress(value);
		}
		if (propName === "city") {
			setCity(value);
		}
	}

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center text-3xl">
				Loading user profile...
			</div>
		);
	}

	return (
		<section className="mt-8 mx-auto max-w-2xl">
			<div className="max-w-2xl mx-auto mt-8">
				<button
					className="flex items-center justify-center border shadow-md px-3 py-2 rounded-md"
					onClick={() => {
						navigate("/profile/users");
					}}
				>
					<FaArrowLeft />
					<span>Show all users</span>
				</button>
			</div>

			{/* Assuming you have a standard navigation or tab component */}
			<h1 className="text-2xl font-bold">Edit User</h1>

			<div className="mt-8">
				{/* <UserForm user={user} onSave={handleSaveButtonClick} /> */}
				<div className="max-w-2xl mx-auto mt-8">
					<div className="md:flex gap-4">
						<form
							className="flex flex-col grow"
							onSubmit={(e) =>
								handleSaveButtonClick(e, {
									originalObject: otherUser,
									userName,
									phone,
									streetAddress,
									city,
									role,
								})
							}
						>
							<label>Full Name</label>
							<input
								disabled={shouldBeDisabled}
								type="text"
								placeholder="Full name"
								value={userName}
								onChange={(e) =>
									handleAddressChange("name", e.target.value)
								}
							/>

							<label>Email</label>
							<input
								type="email"
								disabled
								value={otherUser.email}
								placeholder={"email"}
							/>

							<label>Phone</label>
							<input
								disabled={shouldBeDisabled}
								type="tel"
								placeholder="Phone number"
								value={phone}
								onChange={(e) =>
									handleAddressChange("phone", e.target.value)
								}
							/>

							<label>Street address</label>
							<input
								disabled={shouldBeDisabled}
								type="text"
								placeholder="Street address"
								value={streetAddress}
								onChange={(e) =>
									handleAddressChange(
										"streetAddress",
										e.target.value,
									)
								}
							/>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<label>City</label>
									<input
										disabled={shouldBeDisabled}
										type="text"
										placeholder="City"
										value={city}
										onChange={(e) =>
											handleAddressChange(
												"city",
												e.target.value,
											)
										}
									/>
								</div>
							</div>

							<label>Role</label>
							<select
								value={role}
								onChange={(ev) => setRole(ev.target.value)}
								className="border p-2 rounded"
							>
								<option value="user">User</option>
								<option value="admin">Admin</option>
							</select>

							<button
								className=" bg-primary flex w-full justify-center text-gray-700 font-semibold border border-gray-300 rounded-xl px-3 py-2"
								type="submit"
							>
								Save
							</button>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default EditUserPage;
