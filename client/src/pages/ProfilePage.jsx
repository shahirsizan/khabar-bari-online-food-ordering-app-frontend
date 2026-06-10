import React, { useState } from "react";
import { useUserContext } from "../UserContext";
import { Link, useLocation } from "react-router-dom";

const ProfilePage = () => {
	const { user, handleProfileInfoUpdate } = useUserContext();
	const location = useLocation();

	const [userName, setUserName] = useState(user?.name || "");
	const [phone, setPhone] = useState(user?.phone || "");
	const [streetAddress, setStreetAddress] = useState(
		user?.streetAddress || "",
	);
	const [city, setCity] = useState(user?.city || "");
	const [role, setRole] = useState(user?.role || "");
	// const { data: loggedInUserData } = useProfile();

	function handleAddressChange(propName, value) {
		if (propName === "phone") {
			setPhone(value);
		}
		if (propName === "streetAddress") {
			setStreetAddress(value);
		}
		if (propName === "city") {
			setCity(value);
		}
		if (propName === "role") {
			setRole(value);
		}
	}

	return (
		<section className="mt-20">
			{/* Original code er TABS gula `ProfileLayout` e niye gesi */}

			<div className="max-w-2xl mx-auto mt-8">
				<div className="md:flex gap-4">
					<form
						className="flex flex-col grow"
						onSubmit={(e) =>
							handleProfileInfoUpdate(e, {
								originalObject: user,
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
							type="text"
							placeholder="First and last name"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
						/>

						<label>Email</label>
						<input
							type="email"
							disabled
							value={user.email}
							placeholder={"email"}
						/>

						<label>Phone</label>
						<input
							// disabled={disabled}
							type="tel"
							placeholder="Phone number"
							value={phone}
							onChange={(e) =>
								handleAddressChange("phone", e.target.value)
							}
						/>

						<label>Street address</label>
						<input
							// disabled={disabled}
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

						<label>City</label>
						<input
							// disabled={disabled}
							type="text"
							placeholder="City"
							value={city}
							onChange={(e) =>
								handleAddressChange("city", e.target.value)
							}
						/>

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
		</section>
	);
};

export default ProfilePage;
