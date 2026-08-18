import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { useUserContext } from "../UserContext";

const UsersPage = () => {
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [userToDelete, setUserToDelete] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const { user } = useUserContext();

	const fetchUsers = async () => {
		try {
			const response = await apiFetch(`${backend_base_url}/api/users`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					// Using the token pattern you established
					token: JSON.parse(localStorage.getItem("token")),
				},
			});

			if (response.ok) {
				const data = await response.json();
				setUsers(data);
			} else {
				console.error("Failed to fetch users");
			}
		} catch (error) {
			console.error("Error fetching users: ", error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const deleteUser = async (id) => {
		try {
			const response = await apiFetch(
				`${backend_base_url}/api/users/${id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						// Using the token pattern you established
						token: JSON.parse(localStorage.getItem("token")),
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				setUsers(data);
				fetchUsers();
			} else {
				window.alert("User deletion failed!");
			}
		} catch (error) {
			console.error("Error deleting user: ", error.message);
		}
	};

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2 font-atma">
				<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
				<p className="text-md md:text-xl font-semibold text-gray-600">
					Loading Users...
				</p>
			</div>
		);
	}

	if (user.role !== "admin") {
		return (
			<div className="h-screen flex items-center justify-center text-3xl font-bold">
				You are not authorized to view this page.
			</div>
		);
	}

	return (
		<section className="USERSPAGE max-w-4xl mx-auto mt-8 font-atma">
			<h1 className="text-xl font-bold mb-4">Manage Users</h1>

			<div className="mt-8">
				{users?.length > 0 &&
					users.map((user) => (
						<div
							key={user._id}
							className="bg-gray-100 rounded-lg mb-2 p-4 flex items-center gap-4"
						>
							<div className="grid grid-cols-3 md:grid-cols-3 gap-1 md:gap-4 grow text-xs md:text-sm">
								<div className="text-gray-900 font-semibold">
									{user.name || (
										<span className="italic">No name</span>
									)}
								</div>

								<span className="text-gray-500">
									{user.email}
								</span>

								<span className="text-gray-500">
									{user.role}
								</span>
							</div>

							<div>
								<button
									className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm"
									onClick={() => {
										navigate(`/users/${user._id}`);
									}}
								>
									Edit
								</button>
							</div>

							<div>
								<button
									className="bg-blue-500 text-white px-2 py-1 rounded text-xs md:text-sm"
									onClick={() => {
										setUserToDelete(user._id);
									}}
								>
									Delete
								</button>
							</div>
						</div>
					))}
			</div>

			{/* Deletion confirmation modal appears only if `userToDelete` state holds a user id */}
			{userToDelete && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 font-atma">
					<div className="bg-white p-6 rounded-lg shadow-xl text-xs md:text-sm max-w-96">
						<h2 className="font-semibold mb-4 whitespace-nowrap text-xs md:text-sm">
							ইউজার ডেলেট করার ব্যাপারে নিশ্চিত?
						</h2>

						<div className="flex gap-4">
							<button
								onClick={() => setUserToDelete(null)} // this will hide the modal
								className="flex-1 bg-gray-200 py-2 rounded"
							>
								না
							</button>

							<button
								onClick={async () => {
									await deleteUser(userToDelete);
									setUserToDelete(null);
								}}
								className="flex-1 bg-red-500 text-white py-2 rounded"
							>
								হ্যাঁ
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};

export default UsersPage;
