import mongoose from "mongoose";
import { Order } from "../model/orderModel.js";
import { generateOrderNumber } from "../utils/orderidAndTrxidGenerator.js";
import dotenv from "dotenv";
dotenv.config();

const runMigration = async () => {
	try {
		await mongoose.connect(process.env.db_url as string);
		console.log("Connected to MongoDB for migration...");

		// Find all orders that do not have an orderNumber field
		const legacyOrders = await Order.find({
			orderNumber: { $exists: false },
		});

		console.log(`Found ${legacyOrders.length} legacy orders.`);

		for (const order of legacyOrders) {
			order.orderNumber = generateOrderNumber();
			await order.save();
		}

		console.log("Migration completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
};

runMigration();
