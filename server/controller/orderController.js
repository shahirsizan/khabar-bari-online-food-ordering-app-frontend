import { Order } from "../model/orderModel.js";

export const getOrders = async (req, res) => {
	try {
		const { email, role } = req.user;

		let orders;
		if (role === "admin") {
			// admin gets everything
			orders = await Order.find();
		} else {
			// non-admin users get only their orders
			orders = await Order.find({ userEmail: email });
		}

		console.log(orders);

		return res.status(200).json(orders.reverse());
	} catch (error) {
		console.error("Order Fetch Error:", error.message);
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
			{ _id: id },
			{ status: status },
			{ new: true },
		);

		res.status(200).json(updatedOrder);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
