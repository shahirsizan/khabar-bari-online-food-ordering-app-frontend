import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import these
import { FaArrowLeft } from "react-icons/fa";
import MenuItemForm from "../components/MenuItemForm";
import DeleteModal from "../components/DeleteModal/DeleteModal";

const EditMenuItemPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [menuItem, setMenuItem] = useState(null);
	const [showConfirm, setShowConfirm] = useState(false);

	useEffect(() => {
		const fetchItem = async () => {
			try {
				const response = await fetch(
					`http://localhost:5000/api/menu-items/${id}`,
					{
						method: "GET",
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const res = await response.json();
					setMenuItem(res);
					console.log("res: ", res);
				} else {
					throw new Error("Error in fetchAllItems");
				}
			} catch (error) {
				console.error(error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchItem();
	}, []);

	const handleDelete = async () => {
		try {
			const response = await fetch(
				`http://localhost:5000/api/menu-items/${id}`,
				{
					method: "DELETE",
					headers: {
						token: JSON.parse(localStorage.getItem("token")),
					},
				},
			);

			if (response.ok) {
				console.log("Item deleted successfully");
				navigate("/profile/menu-items");
			}
		} catch (error) {
			console.error("Failed to delete: ", error.message);
		}
	};

	return (
		<>
			{isLoading ? (
				<div className="h-screen flex items-center justify-center text-3xl">
					Loading...
				</div>
			) : (
				<section className="mt-8 max-w-2xl mx-auto">
					<div className="max-w-2xl mx-auto mt-8">
						{/* 2️⃣ ei link click korle back to `/menu-items` route */}
						<button
							className="flex items-center justify-center border shadow-md px-3 py-2 rounded-md"
							onClick={() => {
								navigate("/profile/menu-items");
							}}
						>
							<FaArrowLeft />
							<span>Show all menu items</span>
						</button>
					</div>

					<div className="mt-8">
						<MenuItemForm whatToDo={"edit"} menuItem={menuItem} />
					</div>

					<div className="max-w-md mx-auto mt-4">
						<button
							type="button"
							onClick={() => setShowConfirm(true)}
							className="text-red-500 font-bold"
						>
							Delete this menu item
						</button>
					</div>

					{/* Hidden modal */}
					<DeleteModal
						show={showConfirm}
						onClose={() => setShowConfirm(false)}
						onDelete={handleDelete}
					/>
				</section>
			)}
		</>
	);
};

export default EditMenuItemPage;
