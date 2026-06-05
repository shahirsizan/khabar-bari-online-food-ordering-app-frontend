import { model, models, Schema } from "mongoose";

const OrderSchema = new Schema(
	{
		userName: { type: string, required: true },
		userEmail: { type: string, required: true },
		phone: { type: string, required: true },
		streetAddress: { type: string, required: true },
		city: { type: string, required: true },
		totalAmount: { type: string, required: true },
		cartProducts: Object,
		paid: { type: Boolean, default: false, required: true },
	},
	{ timestamps: true },
);

export const Order = models?.Order || model("Order", OrderSchema);
