import { useState } from "react";
import { useUserContext } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { IoNotificationsCircleSharp } from "react-icons/io5";

const NotificationDropdown = () => {
	const { notifications, setNotifications, unreadCount, setUnreadCount } =
		useUserContext();
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const markAsRead = async (id) => {
		const response = await apiFetch(
			`${backend_base_url}/api/notifications/${id}`,
			{
				method: "PUT",
				headers: { token: JSON.parse(localStorage.getItem("token")) },
			},
		);

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
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="text-xl p-2 relative"
			>
				<IoNotificationsCircleSharp />{" "}
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full px-1">
						{unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 z-50">
					{notifications.map((notification) => (
						<div
							key={notification._id}
							onClick={() => {
								markAsRead(notification._id);
								navigate(notification.link);
							}}
							className={`p-2 border-b cursor-pointer 
                                ${notification.type === "order" ? "bg-blue-100 dark:bg-blue-900" : "bg-green-100 dark:bg-green-900"}`}
						>
							<p className={`text-sm `}>
								{" "}
								{!notification.isRead && "🔴"}{" "}
								{notification.message}
							</p>
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
