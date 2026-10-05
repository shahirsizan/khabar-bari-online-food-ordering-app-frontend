import { INotification, Notification } from "../model/NotificationModel.js";
import { RequestHandler } from "express";

export const getNotifications: RequestHandler<
	{},
	INotification[] | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const notifications = (await Notification.find({
			recipientId: req.user._id,
		})
			.sort({ createdAt: -1 })
			.limit(20)
			.lean()) as INotification[] | [];

		if (notifications.length === 0) {
			return res.status(404).json({ message: "Notifications not found" });
		}

		return res.status(200).json(notifications);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("Error -> getNotifications: ", error.message);
			return res.status(500).json({ message: error.message });
		} else {
			return res.status(500).json({
				message: "getNotifications() error occured",
			});
		}
	}
};

export const markNotificationAsRead: RequestHandler<
	{ id: string },
	{ message: string; notification: INotification } | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const { id } = req.params;

		const notification = (await Notification.findOneAndUpdate(
			{ _id: id, recipientId: req.user._id },
			{ $set: { isRead: true } },
			{ new: true },
		).lean()) as INotification | null;

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		return res.status(200).json({
			message: "Notification marked as read",
			notification,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("Error -> markNotificationAsRead: ", error.message);
		}
		return res.status(500).json({
			message: "markNotificationAsRead() error.",
		});
	}
};

export const markSeveralChatNotificationsAsRead: RequestHandler<
	{},
	{ success: boolean; message: string } | { message: string },
	{ link: string },
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const { link } = req.body;

		await Notification.updateMany(
			{
				recipientId: req.user._id,
				link: link,
				isRead: false,
			},
			{ $set: { isRead: true } },
		);

		return res.status(200).json({
			success: true,
			message: "Chat notifications marked as read.",
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log(
				"Error -> markSeveralChatNotificationsAsRead: ",
				error.message,
			);
		}
		return res.status(500).json({
			message: "নটিফিকেশন কন্ট্রোলারে সমস্যা হয়েছে।",
		});
	}
};
