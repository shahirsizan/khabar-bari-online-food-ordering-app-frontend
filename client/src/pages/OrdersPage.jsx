import React, { useEffect, useState } from "react";
import { useUserContext } from "../UserContext"; // Import your context
import { Link } from "react-router-dom";
import { formatOrderTime } from "../utils/dateFormatter";

const OrdersPage = () => {
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user, isAdmin } = useUserContext();

	const fetchOrders = async () => {
		try {
			const response = await fetch("http://localhost:5000/api/orders", {
				method: "GET",
				headers: {
					token: JSON.parse(localStorage.getItem("token")),
				},
			});

			if (response.ok) {
				const res = await response.json();
				console.log(res);

				setOrders(res);
			}
		} catch (error) {
			console.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	if (isLoading) {
		<div className="h-screen flex items-center justify-center bg-gray-50 gap-2">
			<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
			<p className="text-md md:text-xl font-semibold text-gray-600">
				Loading orders...
			</p>
		</div>;
	}

	return (
		<section className="mt-8 max-w-2xl mx-auto">
			<div className="mt-8">
				{orders?.length > 0 &&
					orders.map((order) => (
						<div
							key={order._id}
							className="bg-gray-100 mb-2 p-4 rounded-lg flex flex-col md:flex-row items-center gap-6"
						>
							<div className="grow flex flex-col md:flex-row items-center gap-6">
								<div>
									<div
										className={
											(order.paid
												? "bg-green-500"
												: "bg-red-400") +
											" p-2 rounded-md text-white w-24 text-center text-sm"
										}
									>
										{order.paid ? "Paid" : "Not paid"}
									</div>
								</div>

								<div className="grow">
									<div className="flex gap-2 items-center mb-1">
										<div className="grow font-bold">
											{order.userEmail}
										</div>

										<div className="text-gray-500 text-sm">
											{
												formatOrderTime(order.createdAt)
													.displayTime
											}
										</div>
									</div>

									<div className="text-gray-500 text-xs">
										{order.cartProducts
											?.map((product) => product.name)
											.join(", ")}
									</div>
								</div>
							</div>

							<div className="justify-end flex gap-2 items-center whitespace-nowrap">
								<Link
									to={`/orders/${order._id}`}
									className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition"
								>
									Show order
								</Link>
							</div>
						</div>
					))}
			</div>
		</section>
	);
};

export default OrdersPage;
