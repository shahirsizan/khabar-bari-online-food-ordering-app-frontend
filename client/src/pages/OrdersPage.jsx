import React, { useEffect, useState } from "react";
import { useUserContext } from "../UserContext"; // Import your context
import { Link } from "react-router-dom";
import { formatOrderTime } from "../utils/dateFormatter";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { GrFormPrevious } from "react-icons/gr";
import { GrFormNext } from "react-icons/gr";
import { toast } from "react-toastify";

const OrdersPage = () => {
	const statuses = {
		All: "All",
		Pending: "Pending",
		Preparing: "Preparing",
		Dispatched: "Dispatched",
		Delivered: "Delivered",
	};

	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { user, isAdmin } = useUserContext();

	// Pagination, Search, and Filter State
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
	const [filterStatus, setFilterStatus] = useState("All");

	const handleStatusChange = async (orderId, changedStatus) => {
		// enum: ["Pending", "Preparing", "Dispatched", "Delivered"],
		let res;
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
				res = await response.json();
				toast.success(res.message);
			}
		} catch (error) {
			toast.error(res.message);
		}
	};

	// debouncing search input.
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setPage(1); // Reset to page 1 on search change
		}, 1000);

		/***
		 * In React, a useEffect cleanup function runs at two specific times:
		 * 1. Right before the component unmounts (disappears from the screen).
		 * Right before running the effect again on a subsequent render (if a dependency changes).
		 */
		return () => clearTimeout(timer);
	}, [searchTerm]);

	// fetch orders on mount OR when `page, search, status` change
	useEffect(() => {
		const fetchOrders = async () => {
			const url = `${backend_base_url}/api/orders?page=${page}&limit=${10}&search=${debouncedSearchTerm}&status=${filterStatus}`;
			try {
				const response = await apiFetch(url, {
					method: "GET",
					headers: {
						token: JSON.parse(localStorage.getItem("token")),
					},
				});

				if (response.ok) {
					const res = await response.json();
					/*** 
					 * Backend code:
					 * return res.status(200).json({
							currentPage: parseInt(page),
							totalPages: Math.ceil(total / limit),
							currentPageOrders: orders,
							totalOrders: total,
						});
					 */
					setOrders(res.currentPageOrders);
					setTotalPages(res.totalPages);
				}
			} catch (error) {
				console.error("fetchOrders -> error: ", error.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrders();
	}, [page, debouncedSearchTerm, filterStatus]);

	if (isLoading) {
		return (
			<div className="h-screen flex items-center justify-center bg-gray-50 gap-2 font-atma">
				<div className="animate-spin rounded-full h-8 w-8 border-b-4 border-green-600 mb-4"></div>
				<p className="text-md md:text-xl font-semibold text-gray-600">
					Loading orders...
				</p>
			</div>
		);
	}

	return (
		<section className="ORDERSPAGE relative mt-8 max-w-5xl mx-auto">
			{/* SEARCH, FILTER, PAGINATION */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 shadow-sm rounded-md font-atma">
				{/* Search Bar. Admin can search with email or orderId, users can filter with Order ID only. */}
				<div className="w-full sm:w-1/2">
					<input
						type="text"
						placeholder={
							isAdmin
								? "Search by email or Order ID..."
								: "Search by Order ID..."
						}
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1); // Reset to page 1 on search change
						}}
						className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-600"
					/>
				</div>

				{/* Status Filter Dropdown */}
				<div className="w-full sm:w-auto flex items-center gap-2">
					<span className="text-sm font-semibold text-gray-600">
						Status:
					</span>

					<select
						value={filterStatus}
						onChange={(e) => {
							setFilterStatus(e.target.value);
							setPage(1); // Reset to page 1 on filter change
						}}
						multiple={false}
						className="px-3 text-xs font-atma rounded-md border border-gray-300 bg-white cursor-pointer focus:outline-none"
					>
						{Object.keys(statuses).map((key) => (
							<option key={key} value={statuses[key]}>
								{key}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* ORDERS LISTING */}
			{orders?.length > 0 ? (
				orders.map((order) => (
					<div
						key={order._id}
						// className="bg-gray-100 text-xs mb-2 p-4 rounded-sm flex flex-col md:flex-row items-center gap-6"
						className="ORDERSLIST text-xs mb-2 p-4 max-md:flex max-md:flex-col max-md:items-center grid grid-cols-[50px_6fr_4fr] items-center gap-5 bg-white shadow-sm shadow-gray-100 rounded-md"
					>
						{/* paid indicator */}
						<div
							className={
								(order.paid ? "bg-green-500" : "bg-red-400") +
								" p-1 rounded-md text-white text-center whitespace-nowrap w-16 font-atma"
							}
						>
							{order.paid ? "Paid" : "Not paid"}
						</div>

						{/* order detail texts */}
						<div className="grow flex flex-col md:flex-row items-center gap-6">
							<div className="grow">
								{/* Order ID and Time Row */}
								<div className="flex gap-2 items-center mb-1 text-[10px] text-gray-500 font-mono tracking-wider">
									<span>Order ID: {order._id}</span>
								</div>

								<div className="flex gap-2 items-center mb-1">
									<div className="grow font-semibold text-sm text-gray-800">
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

							{/* FOR ADMIN: order status change button */}
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
										multiple={false}
										className="px-2 mb-0 font-atma font-semibold rounded-md bg-gradient-to-r from-primary to-secondary cursor-pointer"
									>
										{Object.keys(statuses)
											.filter((s) => s !== "All")
											.map((statusKey) => {
												return (
													<option
														key={statusKey}
														value={
															statuses[statusKey]
														}
													>
														{statuses[statusKey]}
													</option>
												);
											})}
									</select>
								</div>
							)}
						</div>
					</div>
				))
			) : (
				// NO ORDER FOUND
				<div className="py-6 flex items-center justify-center bg-gray-50 gap-2">
					<p className="text-md md:text-xl font-semibold text-gray-600">
						No Orders Found!
					</p>
				</div>
			)}

			{/* PAGINATION CONTROL */}
			{totalPages > 0 && (
				<div className="w-full mt-6 flex justify-center">
					<div className="max-w-2xl flex justify-between items-center gap-10 px-4 py-3 bg-white rounded-md shadow-sm">
						{/* prev button */}
						<button
							onClick={() =>
								setPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={page === 1}
							className="w-auto px-3 py-1  font-semibold bg-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
						>
							<GrFormPrevious className="text-xs sm:text-lg" />
						</button>

						{/* Page # of # */}
						<span className="text-xs sm:text-md font-semibold text-gray-700 font-atma">
							Page {page} of {totalPages || 1}
						</span>

						{/* next button */}
						<button
							onClick={() =>
								setPage((prev) =>
									Math.min(prev + 1, totalPages),
								)
							}
							disabled={page === totalPages}
							className="w-auto px-3 py-1 text-xs font-semibold bg-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
						>
							<GrFormNext className="text-xs sm:text-lg" />
						</button>
					</div>
				</div>
			)}
		</section>
	);
};

export default OrdersPage;
