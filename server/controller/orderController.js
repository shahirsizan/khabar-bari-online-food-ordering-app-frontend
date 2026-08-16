import mongoose, { Mongoose } from "mongoose";
import { Notification } from "../model/NotificationModel.js";
import { Order } from "../model/orderModel.js";
import { getIO } from "../utils/io.js";

export const getOrders = async (req, res) => {
	try {
		const { email, role } = req.user;
		// Get query params: page, limit, search (for email/orderID), status.
		const { page = 1, limit = 10, search, status } = req.query;

		// Build query object.
		let queryObj = {};
		/***
		 * ℹ⚠️ caution:
		 * While developing `queryObj`, make sure the properties of it
		 * are similar to the actual field names of orderModel.
		 */
		if (role !== "admin") {
			// non-admin user gets only the orders containing their email.
			queryObj.userEmail = email;
		} else if (search) {
			// Admins can search by email or order ID
			let searchConditions = [];

			// If `search` looks like a valid Mongoose ObjectId
			// we will check for order id.
			if (mongoose.Types.ObjectId.isValid(search)) {
				searchConditions.push({
					_id: new mongoose.Types.ObjectId(search),
				});
			}

			searchConditions.push({
				userEmail: { $regex: search, $options: "i" },
			});

			queryObj.$or = searchConditions;
		}

		if (status && status !== "All") {
			queryObj.status = status;
		}
		// ex: To fetch page 4, skip (4-1)*limit amount of records.
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const orders = await Order.find(queryObj)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Order.countDocuments(queryObj);

		// console.log(orders);

		return res.status(200).json({
			currentPage: parseInt(page),
			totalPages: Math.ceil(total / limit),
			currentPageOrders: orders,
			totalOrders: total,
		});
	} catch (error) {
		console.error("getOrders -> Error: ", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const getOrder = async (req, res) => {
	try {
		const { email, role } = req.user;
		const { id } = req.params;

		const order = await Order.findById(id);

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Security: authorization check
		// admins can see everything. SO if "admin", bypass the check and return the response anyways.
		// For regular users, check if the orders `userEmail` and the requestors `email` match or not.
		if (role !== "admin" && order.userEmail !== email) {
			return res.status(403).json({
				status: 403,
				message:
					"Unauthorized: You do not have permission to view this order.",
			});
		}

		return res.status(200).json(order);
	} catch (error) {
		console.error("Order Fetch Error:", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const updateOrderStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body; // e.g., "completed"

		const updatedOrder = await Order.findByIdAndUpdate(
			{ _id: new mongoose.Types.ObjectId(id) },
			{ status: status },
			{ new: true },
		);

		if (!updatedOrder) {
			return res.status(404).json({ message: "Order not found" });
		}

		// make notification object.
		const notification = new Notification({
			recipientId: new mongoose.Types.ObjectId(updatedOrder.userId), // Who placed the order
			type: "order",
			message: `Your order #${id} is now ${status}.`,
			link: `/order/${id}`, // Link to the order details page
			metadata: {
				orderId: updatedOrder._id,
				status: updatedOrder.status,
			},
		});

		// Persist the notification in Database
		const savedNotification = await notification.save();

		// Get socket instance and emit notification to corresponding users room
		const io = getIO();
		if (io) {
			io.to(updatedOrder.userId.toString()).emit(
				"order_status_updated",
				savedNotification,
			);
		}

		res.status(200).json({
			message: "স্ট্যাটাস আপডেট প্রক্রিয়া সফল হয়েছে!",
			updatedOrder: updatedOrder,
		});
	} catch (error) {
		console.log("updateOrderStatus() error: ", error.message);

		res.status(500).json({
			message: "স্ট্যাটাস আপডেট প্রক্রিয়া ব্যর্থ হয়েছে!",
		});
	}
};
