import { useEffect, useRef, useState } from "react";
import { useUserContext } from "../UserContext";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { IoNotificationsCircleSharp } from "react-icons/io5";
import { toBanglaNumber } from "../utils/toBanglaNumber";
import { formatOrderTime } from "../utils/dateFormatter";
import { toast } from "react-toastify";

const NotificationDropdown = () => {
	const {
		isAdmin,
		notifications,
		setNotifications,
		unreadCount,
		setUnreadCount,
		setIsChatBoxOpen,
	} = useUserContext();
	const notificationWindowRef = useRef();
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	/***
	 * Attach event listener for outside click
	 */
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

	const markAsRead = async (notification) => {
		if (notification.isRead) {
			return;
		}

		try {
			const endpoint =
				notification.type === "chat"
					? `${backend_base_url}/api/notifications/read-by-link`
					: `${backend_base_url}/api/notifications/${notification._id}`;

			const response = await apiFetch(endpoint, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					token: JSON.parse(localStorage.getItem("token")),
				},
				/***
				 * If isChat is true, it evaluates to { body: JSON.stringify...},
				 * which is then merged into the main object.
				 */
				...(notification.type === "chat" && {
					body: JSON.stringify({ link: notification.link }),
				}),
			});

			/***
		 * Update to main DB done.
			No need to re-fetch notifications from main DB. As we already have the notifications in the context,
			Let's just update the local state to indicate read/unread. 
		*/
			if (response.ok) {
				setNotifications((prev) => {
					/***
					 * here, prev = [n, n, n,.....]
					 */
					const updatedList = prev.map((n) => {
						if (
							notification.type === "chat" &&
							n.type === "chat" &&
							n.link === notification.link
						) {
							/***
							 * If chat notification,
							 * mark all chat notifications with same link(link same means roomId is also same) as `read`
							 */
							return { ...n, isRead: true };
						} else if (
							notification.type !== "chat" &&
							n._id === notification._id
						) {
							/***
							 * If order notification,
							 * mark only that item as `read`
							 */
							return { ...n, isRead: true };
						} else {
							/***
							 * notification not related to the clicked item,
							 * just let them be.
							 */
							return n;
						}
					});

					setUnreadCount(updatedList.filter((n) => !n.isRead).length);
					return updatedList;
				});
			}
		} catch (error) {
			toast.error("নটিফিকেশন কন্ট্রোলারে সমস্যা হয়েছে!");
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
					className="NOTIFICATIONWINDOW h-[500px] overflow-y-auto absolute z-60 right-0 top-12 w-64 bg-white dark:bg-gray-800 shadow-2xl rounded-lg overflow-hidden"
				>
					{notifications.map((notification) => (
						<div
							key={notification._id}
							onClick={(e) => {
								e.stopPropagation();
								markAsRead(notification);
								setIsOpen(false);
							}}
							className="p-3 border-b-2 border-gray-400 cursor-pointer bg-green-100 dark:bg-green-900"
						>
							{notification.type === "order" ? (
								/***
								 * Order notification
								 */
								<Link
									to={`${notification.link}`}
									target="_blank"
									className="grid grid-cols-[8fr_1fr]"
								>
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
								</Link>
							) : /***
							Chat notification 
							*/
							isAdmin ? (
								/***
								 * chat notification for admin.
								 * Upon click, admin jumps into the specific chat room.
								 */
								<Link
									to={`${notification.link}`}
									className="grid grid-cols-[8fr_1fr]"
								>
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
								</Link>
							) : (
								/***
								 * chat notification for non-admin.
								 * Upon clicking, opens the floating chat window
								 */
								<p
									className="grid grid-cols-[8fr_1fr]"
									onClick={(e) => {
										e.stopPropagation();
										setIsChatBoxOpen(true);
										markAsRead(notification);
									}}
								>
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
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default NotificationDropdown;
