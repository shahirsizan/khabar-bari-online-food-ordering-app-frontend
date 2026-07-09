import React, { useEffect, useState } from "react";
import { useUserContext } from "../UserContext"; // Import your context
import { Link } from "react-router-dom";
import { formatOrderTime } from "../utils/dateFormatter";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";

const OrdersPage = () => {
	const statuses = {
		Pending: "Pending",
		Preparing: "Preparing",
		Dispatched: "Dispatched",
		Delivered: "Delivered",
	};

	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user, isAdmin } = useUserContext();

	const handleStatusChange = async (orderId, changedStatus) => {
		// enum: ["Pending", "Preparing", "Dispatched", "Delivered"],

		try {
			const response = await apiFetch(
				`${backend_base_url}/api/order/${orderId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						token: JSON.parse(localStorage.getItem("token")),
					},
					body: JSON.stringify({ status: changedStatus }),
				},
			);

			if (response.ok) {
				// update the local state to refresh the UI immediately
				setOrders((prev) =>
					prev.map((order) =>
						order._id === orderId
							? { ...order, status: changedStatus }
							: order,
					),
				);
			}
		} catch (error) {
			console.error("Failed to update status", error);
		}
	};

	// fetch orders on mount
	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const response = await apiFetch(
					`${backend_base_url}/api/orders`,
					{
						method: "GET",
						headers: {
							token: JSON.parse(localStorage.getItem("token")),
						},
					},
				);

				if (response.ok) {
					const res = await response.json();
					// console.log(res);

					setOrders(res);
				}
			} catch (error) {
				console.error(error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2">
				<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
				<p className="text-md md:text-xl font-semibold text-gray-600">
					Loading orders...
				</p>
			</div>
		);
	}

	return (
		<section className="ORDERSPAGE relative mt-8 max-w-5xl mx-auto">
			{/* <SupportChatLauncher /> */}

			{orders?.length > 0 &&
				orders.map((order) => (
					<div
						key={order._id}
						// className="bg-gray-100 text-xs mb-2 p-4 rounded-sm flex flex-col md:flex-row items-center gap-6"
						className="bg-gray-100 text-xs mb-2 p-4 rounded-sm max-md:flex max-md:flex-col max-md:items-center grid grid-cols-[50px_6fr_4fr] items-center gap-5"
					>
						{/* paid indicator */}
						<div
							className={
								(order.paid ? "bg-green-500" : "bg-red-400") +
								" p-1 rounded-md text-white w-10 text-center "
							}
						>
							{order.paid ? "Paid" : "Not paid"}
						</div>

						{/* order detail texts */}
						<div className="grow flex flex-col md:flex-row items-center gap-6">
							<div className="grow">
								<div className="flex gap-2 items-center mb-1">
									<div className="grow font-bold">
										{order.userEmail}
									</div>

									<div className="text-gray-600">
										{
											formatOrderTime(order.createdAt)
												.displayTime
										}
									</div>
								</div>

								<div className="text-gray-600">
									{order.cartProducts
										?.map((product) => product.name)
										.join(", ")}
								</div>
							</div>
						</div>

						{/* other buttons */}
						<div className="flex gap-2">
							<Link
								to={`/order/${order._id}`}
								className="flex items-center justify-center px-2 py-1 w-full bg-gray-200 font-atma font-semibold text-center rounded-md hover:bg-gray-300 cursor-pointer transition"
							>
								Detail
							</Link>

							{/* order status badge */}
							<button
								disabled
								className={`flex items-center justify-center px-2 py-1 rounded-md font-atma font-semibold ${order.status === "Pending" ? "bg-red-700 text-white" : ""}
									${order.status === "Preparing" ? "bg-amber-800 text-white" : ""}
									${order.status === "Dispatched" ? "bg-blue-500 text-white" : ""}
									${order.status === "Delivered" ? "bg-green-700 text-white" : ""}`}
							>
								{order.status}
							</button>

							{/* order status change button for admin */}
							{isAdmin && (
								<div className="w-full">
									<select
										value={order.status}
										onChange={(ev) => {
											handleStatusChange(
												order._id,
												ev.target.value,
											);
										}}
										className="px-2 mb-0 font-atma font-semibold rounded-md bg-gradient-to-r from-primary to-secondary cursor-pointer"
									>
										{Object.keys(statuses).map((status) => {
											return (
												<option
													key={status}
													value={statuses[status]}
												>
													{statuses[status]}
												</option>
											);
										})}
									</select>
								</div>
							)}
						</div>
					</div>
				))}
		</section>
	);
};

export default OrdersPage;
