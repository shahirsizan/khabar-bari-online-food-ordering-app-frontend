import React, { useState } from "react";
import { useUserContext } from "../UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ProfilePage = () => {
	const { user, handleProfileInfoUpdate } = useUserContext();
	const navigate = useNavigate();
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
		<section className="mt-10 mb-10 font-atma">
			{/* TABS bar -> in `ProfileLayout` */}

			<div className="max-w-2xl mx-auto mt-8">
				<div className="gap-4">
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
						<label>নাম</label>
						<input
							type="text"
							placeholder="First and last name"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
						/>

						<label>ইমেইল</label>
						<input
							type="email"
							disabled
							value={user.email}
							placeholder={"email"}
						/>

						<label>ফোন</label>
						<input
							// disabled={disabled}
							type="tel"
							placeholder="Phone number"
							value={phone}
							onChange={(e) =>
								handleAddressChange("phone", e.target.value)
							}
						/>

						<label>ঠিকানা</label>
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

						<label>শহর</label>
						<input
							// disabled={disabled}
							type="text"
							placeholder="City"
							value={city}
							onChange={(e) =>
								handleAddressChange("city", e.target.value)
							}
						/>

						{user?.role === "admin" ? (
							<>
								<label>রোল</label>
								<select
									value={role}
									onChange={(ev) => setRole(ev.target.value)}
									className="border p-2 rounded"
								>
									<option value="user">ইউজার</option>
									<option value="admin">এডমিন</option>
								</select>
							</>
						) : (
							<>
								<label>রোল</label>
								<input
									// disabled={disabled}
									type="text"
									placeholder="Role"
									value={role === "admin" ? "এডমিন" : "ইউজার"}
									disabled
								/>
							</>
						)}

						<button
							className="mt-5 bg-primary flex w-full justify-center !text-gray-700 font-semibold border border-gray-300 rounded-xl px-3 py-2"
							type="submit"
						>
							সেভ করুন
						</button>
					</form>

					<button
						className="mt-5 bg-primary flex w-full justify-center !text-gray-700 font-semibold border border-gray-300 rounded-xl px-3 py-2"
						onClick={() => {
							navigate("/profile/change-password");
						}}
					>
						পাসওয়ার্ড পরিবর্তন করুন
					</button>
				</div>
			</div>
		</section>
	);
};

export default ProfilePage;
