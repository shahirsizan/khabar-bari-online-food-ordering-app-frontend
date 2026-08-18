import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import these
import { FaArrowLeft } from "react-icons/fa";
import MenuItemForm from "../components/MenuItemForm";
import DeleteModal from "../components/DeleteModal/DeleteModal";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { toast } from "react-toastify";

const EditMenuItemPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [isLoading, setIsLoading] = useState(true);
	const [menuItem, setMenuItem] = useState(null);
	const [showConfirm, setShowConfirm] = useState(false);

	/***
	 * Fetch all items on mount
	 */
	useEffect(() => {
		const fetchItem = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/menu-items/${id}`,
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
					// console.log("res: ", res);
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
		let res;

		try {
			const response = await apiFetch(
				`${backend_base_url}/api/menu-items/${id}`,
				{
					method: "DELETE",
					headers: {
						token: JSON.parse(localStorage.getItem("token")),
					},
				},
			);

			res = await response.json();

			if (response.ok) {
				toast.success(res.message);
				navigate("/profile/menu-items", { replace: true });
			}
		} catch (error) {
			toast.error(res.message);
		}
	};

	return (
		<>
			{isLoading ? (
				<div className="h-screen flex items-center justify-center text-3xl font-atma">
					Loading...
				</div>
			) : (
				<section className="mt-10 mb-10 px-[5vw] md:px-[8vw] lg:px-[10vw]">
					<div className="max-w-2xl mx-auto mt-8">
						{/* 2️⃣ ei link click korle back to `/menu-items` route */}
						<button
							className="flex items-center justify-center border shadow-md px-3 py-2 rounded-md font-atma"
							onClick={() => {
								navigate("/profile/menu-items");
							}}
						>
							<FaArrowLeft />
							<span>সকল মেনু আইটেম</span>
						</button>
					</div>

					<div className="mt-8">
						<MenuItemForm whatToDo={"edit"} menuItem={menuItem} />
					</div>

					<div className="max-w-md mx-auto mt-4">
						<button
							type="button"
							onClick={() => setShowConfirm(true)}
							className="text-red-500 font-semibold font-atma shadow-md mt-6"
						>
							Delete This Item
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
