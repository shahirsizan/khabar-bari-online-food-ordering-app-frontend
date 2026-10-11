import mongoose from "mongoose";
import { Notification } from "../model/NotificationModel.js";
import { IOrder, Order, OrderStatusType } from "../model/orderModel.js";
import { getIO } from "../utils/io.js";
import { RequestHandler } from "express";

export const getOrders: RequestHandler<
	{},
	| {
			currentPage: number;
			totalPages: number;
			currentPageOrders: IOrder[];
			totalOrders: number;
	  }
	| { message: string },
	{},
	{ page?: string; limit?: string; search?: string; status?: OrderStatusType }
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const { email, role } = req.user;

		/***
		 * Get query params: page, limit, search (for email/orderID), status.
		 */
		const { page = "1", limit = "10", search, status } = req.query;

		/***
		 *  Build query object.
		 */
		let queryObj: any = {};

		/***
		 * ⚠️Caution:
		 * While developing `queryObj`, make sure the properties of it
		 * are similar to the actual field names of orderModel.
		 */
		if (role !== "admin") {
			/***
			 * Non-admin users email is automatically embedded into queryObj.
			 * So no matter what they search in the searchbar,
			 * only the orders that contain their email as `userEmail` will be shown.
			 * For admin, since there will be no embedded `userEmail` in the query,
			 * his search will cover orders from all emails.
			 */
			queryObj.userEmail = email;
		}

		if (search) {
			/***
			 * Admins can search by email or order ID
			 */
			let searchConditions: any = [];

			/***
			 * If `search` contains ID,
			 */
			if (mongoose.Types.ObjectId.isValid(search)) {
				searchConditions.push({
					_id: new mongoose.Types.ObjectId(search),
				});
			}

			/***
			 * if search contains other text ( email)
			 */
			searchConditions.push({
				userEmail: { $regex: search, $options: "i" },
			});

			queryObj.$or = searchConditions;
		}

		/***
		 * Apply status filter
		 */
		if (status && status !== "All") {
			queryObj.status = status;
		}

		/***
		 * ex: To fetch page 4, skip (4-1)*limit amount of records.
		 */
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const orders = await Order.find(queryObj)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Order.countDocuments(queryObj);

		// console.log(orders);

		return res.status(200).json({
			currentPage: parseInt(page),
			totalPages: Math.ceil(total / parseInt(limit)),
			currentPageOrders: orders,
			totalOrders: total,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("getOrders -> Error: ", error.message);
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: "getOrders -> Error occured" });
		}
	}
};

export const getOrder: RequestHandler<
	{ id: string },
	IOrder | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated." });
		}

		const { email, role } = req.user;
		const { id } = req.params;

		const order = (await Order.findById(id)) as IOrder | null;

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Security: authorization check
		// admins can see everything. SO if "admin", bypass the check and return the response anyways.
		// For regular users, check if the orders `userEmail` and the requestors `email` match or not.
		if (role !== "admin" && order.userEmail !== email) {
			return res.status(403).json({
				message:
					"Unauthorized: You do not have permission to view this order.",
			});
		}

		return res.status(200).json(order);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Order Fetch Error:", error.message);
			res.status(500).json({ message: error.message });
		} else {
			res.status(500).json({ message: "getOrder() error" });
		}
	}
};

export const updateOrderStatus: RequestHandler<
	{ id: string },
	{ updatedOrder: IOrder; message: string } | { message: string },
	{ status: OrderStatusType },
	{}
> = async (req, res) => {
	try {
		const { id } = req.params;
		const { status } = req.body; // Example: "Delivered"

		const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
			{ _id: new mongoose.Types.ObjectId(id) },
			{ status: status },
			{ new: true },
		);

		if (!updatedOrder) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Make notification object.
		const notification = new Notification({
			recipientId: updatedOrder.userId as mongoose.Types.ObjectId, // Who placed the order
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
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("updateOrderStatus() error: ", error.message);

			res.status(500).json({
				message: "স্ট্যাটাস আপডেট প্রক্রিয়া ব্যর্থ হয়েছে!",
			});
		} else {
			res.status(500).json({
				message: "স্ট্যাটাস আপডেট প্রক্রিয়া ব্যর্থ হয়েছে!",
			});
		}
	}
};
