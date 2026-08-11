import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { IoNotificationsCircleSharp } from "react-icons/io5";
import { toBanglaNumber } from "../utils/toBanglaNumber";
import { formatOrderTime } from "../utils/dateFormatter";

const NotificationDropdown = () => {
	const { notifications, setNotifications, unreadCount, setUnreadCount } =
		useUserContext();
	const notificationWindowRef = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const handleClickOutside = (e) => {
			// If:
			// 1. `click` was outside the notification window
			// 2. `notificationWindowRef` exists,
			// 3. Currently if isOpen == true
			// => call setIsOpen(false)

			if (
				notificationWindowRef.current &&
				!notificationWindowRef.current.contains(e.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const markAsRead = async (id) => {
		const response = await apiFetch(
			`${backend_base_url}/api/notifications/${id}`,
			{
				method: "PUT",
				headers: { token: JSON.parse(localStorage.getItem("token")) },
			},
		);

		// Update to main DB is done.
		// No need to re-fetch the notifications from main DB. As we already have the notifications in the context,
		// we can just update the state to mark the notification as read.
		if (response.ok) {
			setNotifications((prev) =>
				prev.map((notification) =>
					notification._id === id
						? { ...notification, isRead: true }
						: notification,
				),
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}
	};

	return (
		<div className="relative">
			{/* NOTIFICATION BUTTON */}
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(!isOpen);
				}}
				className="p-3 relative border-none rounded-xl shadow-md shadow-amber-900/20 bg-gradient-to-r from-primary to-secondary text-xs md:text-sm font-semibold drop-shadow-[2px_2px_2px_gray]"
			>
				<IoNotificationsCircleSharp />{" "}
				{unreadCount > 0 && (
					<span className="absolute -top-3 -right-2 bg-red-500 text-white text-[8px] md:text-[14px] w-5 h-5 rounded-full inline-flex items-center justify-center">
						{toBanglaNumber(unreadCount)}
					</span>
				)}
			</button>

			{/* HIDDEN WINDOW */}
			{isOpen && (
				<div
					ref={notificationWindowRef}
					className="NOTIFICATIONWINDOW absolute z-60 right-0 top-12 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden"
				>
					{notifications.map((notification) => (
						<div
							key={notification._id}
							onClick={() => {
								markAsRead(notification._id);
								setIsOpen(false);
								// navigate(notification.link);
							}}
							className={`p-2 border-b-2 border-gray-400 cursor-pointer 
                                ${notification.type === "order" ? "bg-blue-100 dark:bg-blue-900" : "bg-green-100 dark:bg-green-900"}
								`}
						>
							{notification.type === "order" ? (
								<>
									<Link
										to={`${notification.link}`}
										target="_blank"
										className="grid grid-cols-[4fr_1fr]"
									>
										<p
											className={`text-xs md:text-sm break-words`}
										>
											{" "}
											{!notification.isRead && "🔵"}{" "}
											{notification.message}
										</p>

										<p
											className={`text-[10px] flex items-center justify-end`}
										>
											{
												formatOrderTime(
													notification.createdAt,
												).displayTime
											}
										</p>
									</Link>
								</>
							) : (
								<>
									<p
										className={`text-xs md:text-sm break-words`}
									>
										{" "}
										{!notification.isRead && "🔵"}{" "}
										{notification.message}
									</p>

									<p className={`text-[8px]`}>
										{
											formatOrderTime(
												notification.createdAt,
											).displayTime
										}
									</p>
								</>
							)}
						</div>
					))}
				</div>
			)}
			{/* order status change er notification non-admin user er kacche thikmoto jacche.
            But chat er notification gula dekhte hobe

            Order Fetch Error: Cast to ObjectId failed for value "undefined" 
            (type string) at path "_id"for model "Order"
            
            error dekhacche  */}
		</div>
	);
};

export default NotificationDropdown;
