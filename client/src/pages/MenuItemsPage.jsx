import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuItemForm from "../components/MenuItemForm";
import { FaArrowRight, FaEdit } from "react-icons/fa";
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
						<span>নতুন আইটেম এড করুন</span>
						<FaArrowRight />
					</button>

					{/* EXISTING ITEMS GRID */}
					<div>
						<h2 className="text-xs md:text-lg text-gray-500 mt-8 mb-4">
							আইটেম এডিট করতে ক্লিক করুন
						</h2>

						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
							{menuItems?.length > 0 &&
								menuItems.map((item) => (
									<Link
										key={item._id}
										to={`/menu-items/edit/${item._id}`}
										className="bg-gray-200 rounded-lg p-4 group hover:shadow-lg transition-all duration-200"
									>
										<div className="flex flex-col gap-2">
											<div className="relative flex items-center justify-center">
												<img
													className="rounded-md max-w-30 md:max-w-40 aspect-square overflow-hidden object-cover"
													src={item.image}
													alt={""}
												/>

												{/* Hover overlay and edit icon */}
												<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
													<FaEdit className="text-white text-2xl md:text-xl drop-shadow-md transform scale-75 group-hover:scale-100 transition-transform duration-300" />
												</div>
											</div>

											<div className="text-center text-xs md:text-sm">
												{item.name}
											</div>

											<div className="text-center text-xs md:text-sm">
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
