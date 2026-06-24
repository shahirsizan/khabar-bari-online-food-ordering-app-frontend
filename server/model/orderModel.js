import mongoose, { model, Schema } from "mongoose";

const OrderSchema = new Schema(
	{
		userName: { type: String, required: true },
		userEmail: { type: String, required: true },
		phone: { type: String, required: true },
		streetAddress: { type: String, required: true },
		city: { type: String, required: true },
		totalAmount: { type: String, required: true },
		cartProducts: Object,
		tran_id: { type: String, required: true, unique: true, index: true },
		paid: { type: Boolean, default: false, required: true },
		status: {
			type: String,
			default: "Pending",
			enum: ["Pending", "Preparing", "Dispatched", "Delivered"],
		},
	},
	{ timestamps: true },
);

// This line tells MongoDB to auto-delete documents where:
// 1. 'paid' is false
// 2. 'createdAt' is older than 3600 seconds (1 hour)
OrderSchema.index(
	{ createdAt: 1 },
	{
		expireAfterSeconds: 1800,
		partialFilterExpression: { paid: false },
	},
);

export const Order = mongoose.models?.Order || model("Order", OrderSchema);
