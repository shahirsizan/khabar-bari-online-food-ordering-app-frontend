import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuItemForm from "../components/MenuItemForm";
import { FaArrowRight } from "react-icons/fa";

const MenuItemsPage = () => {
	const navigate = useNavigate();
	const [menuItems, setMenuItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchAllItems = async () => {
			try {
				const response = await fetch(
					"http://localhost:5000/api/menu-items",
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

	return (
		<>
			{isLoading ? (
				<div className="h-screen flex items-center justify-center text-3xl">
					Loading...
				</div>
			) : (
				<section className="mt-8 max-w-2xl mx-auto">
					<button
						className="mt-8 flex items-center justify-center border shadow-md px-3 py-2 rounded-md"
						onClick={() => {
							navigate("/menu-items/new");
						}}
					>
						<span>Crete new menu item</span>
						<FaArrowRight />
					</button>

					<div>
						<h2 className="text-sm text-gray-500 mt-8">
							Edit menu item:
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

											<div className="text-center">
												{item.name}
											</div>

											<div className="text-center">
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
