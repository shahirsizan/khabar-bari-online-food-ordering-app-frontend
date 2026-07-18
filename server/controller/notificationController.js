import { Notification } from "../model/NotificationModel.js";

export const getNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({
			recipientId: req.user._id,
		})
			.sort({ createdAt: -1 })
			.limit(20); // Keep it paginated or limited

		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error -> getNotifications: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const markNotificationAsRead = async (req, res) => {
	try {
		const { id } = req.params;
		const notification = await Notification.findByIdAndUpdate(
			id,
			{ isRead: true },
			{ new: true },
		);
		res.status(200).json(notification);
	} catch (error) {
		console.log("Error -> markNotificationAsRead: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
