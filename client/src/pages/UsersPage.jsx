import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UsersPage = () => {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const response = await fetch(
					"http://localhost:5000/api/users",
					{
						method: "GET",
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
				} else {
					console.error("Failed to fetch users");
				}
			} catch (error) {
				console.error("Error fetching users: ", error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUsers();
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center text-3xl font-bold">
				Loading users...
			</div>
		);
	}

	return (
		<section className="max-w-2xl mx-auto mt-8">
			<h1 className="text-2xl font-bold mb-4">Manage Users</h1>

			<div className="mt-8">
				{users?.length > 0 &&
					users.map((user) => (
						<div
							key={user._id}
							className="bg-gray-100 rounded-lg mb-2 p-4 flex items-center gap-4"
						>
							<div className="grid grid-cols-3 md:grid-cols-3 gap-1 md:gap-4 grow text-sm md:text-lg">
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
								<Link
									className="bg-blue-500 text-white px-3 py-2 rounded text-sm md:text-lg"
									to={`/users/${user._id}`}
								>
									Edit
								</Link>
							</div>
						</div>
					))}
			</div>
		</section>
	);
};

export default UsersPage;
