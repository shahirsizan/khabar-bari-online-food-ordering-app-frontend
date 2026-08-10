import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuItemForm from "../components/MenuItemForm";
import { FaArrowRight } from "react-icons/fa";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { useUserContext } from "../UserContext";

const MenuItemsPage = () => {
	const navigate = useNavigate();
	const { user } = useUserContext();
	const [menuItems, setMenuItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchAllItems = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/menu-items`,
					{
						method: "GET",
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const res = await response.json();
					setMenuItems(res);
					// console.log(res);
				} else {
					throw new Error("Error in fetchAllItems");
				}
			} catch (error) {
				console.error(error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAllItems();
	}, []);

	if (user.role !== "admin") {
		return (
			<div className="h-[300px] flex items-center justify-center text-2xl font-bold">
				You are not authorized to view this page.
			</div>
		);
	}

	return (
		<>
			{isLoading ? (
				<div className="h-screen flex items-center justify-center text-3xl">
					Loading...
				</div>
			) : (
				<section className="mt-10 mb-10 max-w-2xl mx-auto font-atma">
					{/* CREATE NEW ITEM BUTTON*/}
					<button
						className="mt-8 flex items-center justify-center border shadow-md px-3 py-2 rounded-md"
						onClick={() => {
							navigate("/menu-items/new");
						}}
					>
						<span>Create New Item</span>
						<FaArrowRight />
					</button>

					{/* EXISTING ITEMS GRID */}
					<div>
						<h2 className="text-md text-gray-500 mt-8 mb-4">
							Select Item to Edit:
						</h2>

						<div className="grid grid-cols-3 gap-2">
							{menuItems?.length > 0 &&
								menuItems.map((item) => (
									<Link
										key={item._id}
										to={`/menu-items/edit/${item._id}`}
										className="bg-gray-200 rounded-lg p-4"
									>
										<div className="flex flex-col gap-2">
											<div className=" flex items-center justify-center">
												<img
													className="rounded-md w-40 aspect-square overflow-hidden object-cover"
													src={item.image}
													alt={""}
												/>
											</div>

											<div className="text-center text-xs md:text-xl">
												{item.name}
											</div>

											<div className="text-center text-xs md:text-xl">
												{item.basePrice} BDT
											</div>
										</div>
									</Link>
								))}
						</div>
					</div>
				</section>
			)}
		</>
	);
};

export default MenuItemsPage;
