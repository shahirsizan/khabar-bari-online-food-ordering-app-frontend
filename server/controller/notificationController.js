import mongoose from "mongoose";
import { ObjectId } from "mongodb";
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

		const notification = await Notification.findOneAndUpdate(
			{ _id: id, recipientId: req.user._id },
			{ $set: { isRead: true } },
			{ new: true },
		);

		res.status(200).json({
			message: "Notification marked as read",
			notification,
		});
	} catch (error) {
		console.log("Error -> markNotificationAsRead: ", error.message);
		res.status(500).json({
			message: "নটিফিকেশন কন্ট্রোলারে সমস্যা হয়েছে।",
		});
	}
};

export const markSeveralChatNotificationsAsRead = async (req, res) => {
	try {
		const { link } = req.body;

		// console.log("link: ", link);

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
	} catch (error) {
		console.log(
			"Error -> markSeveralChatNotificationsAsRead: ",
			error.message,
		);
		res.status(500).json({
			message: "নটিফিকেশন কন্ট্রোলারে সমস্যা হয়েছে।",
		});
	}
};
