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
