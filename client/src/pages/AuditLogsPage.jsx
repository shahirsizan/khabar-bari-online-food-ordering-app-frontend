import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { useUserContext } from "../UserContext";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
import { FiChevronDown, FiChevronUp, FiCode, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";

const ACTION_COLORS = {
	CREATE_MENU_ITEM: "bg-green-100 text-green-700 border-green-200",
	UPDATE_MENU_ITEM: "bg-blue-100 text-blue-700 border-blue-200",
	DELETE_MENU_ITEM: "bg-red-100 text-red-700 border-red-200",
	PLACE_ORDER: "bg-emerald-100 text-emerald-800 border-emerald-300",
	UPDATE_ORDER_STATUS: "bg-amber-100 text-amber-800 border-amber-300",
	DELETE_USER: "bg-rose-100 text-rose-800 border-rose-300",
	UPDATE_USER: "bg-indigo-100 text-indigo-700 border-indigo-200",
	RESET_USER_PASSWORD: "bg-purple-100 text-purple-700 border-purple-200",
};

const AuditLogsPage = () => {
	const [logs, setLogs] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
	const [selectedAction, setSelectedAction] = useState("");
	const [selectedEntityType, setSelectedEntityType] = useState("");
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [expandedLogId, setExpandedLogId] = useState(null);

	const limit = 10;

	/***
	 * Debouncing search input.
	 * Wait for 1 second of inactivity,
	 */
	useEffect(() => {
		const timerId = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
			setPage(1);
		}, 1000);

		/***
		 * In React, a useEffect cleanup function runs at two specific moments:
		 * 1. Right before the component unmounts (disappears from the screen).
		 * 2. Right before running the effect again on a subsequent render (Dependency changes).
		 */
		return () => clearTimeout(timerId);
	}, [searchTerm]);

	/***
	 * Fetch logs.
	 */
	useEffect(() => {
		const fetchLogs = async () => {
			setIsLoading(true);

			try {
				const url = `${backend_base_url}/api/audit-logs?page=${page}&limit=${limit}&action=${selectedAction}&targetEntityType=${selectedEntityType}&search=${debouncedSearchTerm}`;

				const res = await apiFetch(url, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const data = await res.json();

				if (res.ok) {
					setLogs(data.logs || []);
					setTotalPages(data.totalPages || 1);
				} else {
					toast.error(data.message);
				}
			} catch (error) {
				console.error("Audit fetch error: ", error);
				toast.error("এক্টিভিটি লগ লোড করতে সমস্যা হয়েছে!");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLogs();
	}, [page, selectedAction, selectedEntityType, debouncedSearchTerm]);

	const handleToggleExpand = (id) => {
		setExpandedLogId((prev) => (prev === id ? null : id));
	};

	return (
		<section className="AUDITLOGSECTION relative mt-8 max-w-4xl mx-auto font-atma">
			{/* Search & Filters */}
			<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white p-4 shadow-sm rounded-md border border-gray-100">
				{/* Search */}
				<div className="w-full sm:w-1/3 relative">
					<input
						type="text"
						placeholder="Search by Email, Entity Type or Action..."
						value={searchTerm}
						onChange={(e) => {
							setSearchTerm(e.target.value);
							setPage(1);
						}}
						className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-600"
					/>
				</div>

				{/* Filters */}
				<div className="w-full sm:w-2/3 flex flex-wrap sm:flex-nowrap justify-end items-center gap-3">
					{/* Action Filter */}
					<div className="flex items-center gap-1.5 w-full sm:w-auto">
						<span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
							Action:
						</span>

						<select
							value={selectedAction}
							onChange={(e) => {
								setSelectedAction(e.target.value);
								setPage(1);
							}}
							className="w-full sm:w-auto px-2 py-1.5 text-xs rounded-md border border-gray-300 bg-white cursor-pointer focus:outline-none"
						>
							<option value="">All</option>
							{Object.keys(ACTION_COLORS).map((act) => (
								<option key={act} value={act}>
									{act}
								</option>
							))}
						</select>
					</div>

					{/* Entity Type Filter */}
					<div className="flex items-center gap-1.5 w-full sm:w-auto">
						<span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
							Entity Type:
						</span>

						<select
							value={selectedEntityType}
							onChange={(e) => {
								setSelectedEntityType(e.target.value);
								setPage(1);
							}}
							className="w-full sm:w-auto px-2 py-1.5 text-xs rounded-md border border-gray-300 bg-white cursor-pointer focus:outline-none"
						>
							<option value="">All</option>
							<option value="MenuItem">MenuItem</option>
							<option value="Order">Order</option>
							<option value="User">User</option>
						</select>
					</div>
				</div>
			</div>

			{/* LOGS LIST */}
			{isLoading ? (
				<div className="bg-white p-8 rounded-md shadow-sm text-center text-gray-500 text-xs md:text-lg">
					Loading audit records...
				</div>
			) : logs.length > 0 ? (
				<div className="flex flex-col gap-3">
					{logs.map((log) => {
						const isExpanded = expandedLogId === log._id;
						const actionBadgeClass =
							ACTION_COLORS[log.action] ||
							"bg-gray-100 text-gray-700 border-gray-200";

						return (
							<div
								key={log._id}
								className="bg-white border border-gray-200/80 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-200"
							>
								{/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-3"> */}
								<div className="flex flex-col md:grid md:grid-cols-[4fr_3fr_4fr] justify-between gap-3">
									{/* Left: Action & Email */}
									<div className="flex items-start md:items-center gap-3">
										<div>
											<p className="text-xs font-semibold text-gray-800">
												{log.userId?.name ||
													log.userId.name ||
													"System / Unknown"}{" "}
												({log.userId.role})
											</p>

											<p className="text-xs font-semibold text-gray-800">
												{log.userId?.email ||
													log.userId.email ||
													"System / Unknown"}{" "}
											</p>

											<p className="text-xs font-semibold text-gray-800">
												{log.userId?.phone ||
													log.userId.phone ||
													"System / Unknown"}{" "}
											</p>

											<p
												className={`px-2.5 py-1 text-xs font-semibold text-gray-800 rounded-md border ${actionBadgeClass}`}
											>
												{log.action}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-center md:justify-start">
										<p
											className={`px-2.5 py-1 text-xs font-semibold text-gray-800 rounded-md border ${actionBadgeClass}`}
										>
											Affected Entity Type:{" "}
											<span className=" text-gray-700">
												{log.targetEntityType}
											</span>
											{log.targetId &&
												` (ID: ${log.targetId})`}
										</p>
									</div>

									{/* Right: Details */}
									<div className="flex items-center justify-between md:justify-end gap-4 text-xs text-gray-600 border-t md:border-t-0 pt-2 md:pt-0 border-gray-100">
										<div className="text-left md:text-right">
											<p className="text-xs font-semibold text-gray-800">
												{new Date(
													log.createdAt,
												).toLocaleString()}
											</p>
										</div>

										<button
											onClick={() =>
												handleToggleExpand(log._id)
											}
											className="flex items-center w-28 gap-1 text-xs text-red-700 hover:text-red-800 font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-md transition cursor-pointer"
										>
											<FiCode className="text-xs" />

											<span className="text-xs font-semibold text-gray-800">
												{isExpanded ? "Hide" : "Detail"}
											</span>

											{isExpanded ? (
												<FiChevronUp />
											) : (
												<FiChevronDown />
											)}
										</button>
									</div>
								</div>

								{/* Expandable JSON Payloads */}
								{isExpanded && (
									<div className="mt-4 pt-3 border-t border-gray-100 bg-gray-900 rounded-md p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-80">
										<p className="text-gray-400 text-[10px] mb-1 font-sans">
											// Payload Details:
										</p>

										<pre>
											{JSON.stringify(
												log.details || {},
												null,
												3,
											)}
										</pre>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : (
				<div className="bg-white p-8 rounded-md shadow-sm text-center text-gray-500 text-xs">
					No audit log records found matching your filters.
				</div>
			)}

			{/* Pagination. */}
			{totalPages > 0 && (
				<div className="w-full mt-6 flex justify-center">
					<div className="max-w-2xl flex justify-between items-center gap-10 px-4 py-3 bg-white rounded-md shadow-sm">
						<button
							onClick={() =>
								setPage((prev) => Math.max(prev - 1, 1))
							}
							disabled={page === 1}
							className="w-auto px-3 py-1 font-semibold bg-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
						>
							<GrFormPrevious className="text-xs sm:text-lg" />
						</button>

						<span className="text-xs sm:text-md font-semibold text-gray-700">
							Page {page} of {totalPages || 1}
						</span>

						<button
							onClick={() =>
								setPage((prev) =>
									Math.min(prev + 1, totalPages),
								)
							}
							disabled={page === totalPages}
							className="w-auto px-3 py-1 font-semibold bg-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-400 transition cursor-pointer disabled:cursor-not-allowed"
						>
							<GrFormNext className="text-xs sm:text-lg" />
						</button>
					</div>
				</div>
			)}
		</section>
	);
};

export default AuditLogsPage;
