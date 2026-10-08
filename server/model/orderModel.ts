import mongoose, { model, Schema, Document } from "mongoose";
import { IUser } from "./userModel.js";

export interface ICartProduct {
	id: string;
	name: string;
	price: number;
	desc: string;
	image: string;
	quantity: number;
}

export type OrderStatusType =
	| "Pending"
	| "Preparing"
	| "Dispatched"
	| "Delivered"
	| "All";

export interface IOrder {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId | IUser;
	userName: string;
	userEmail: string;
	phone: string;
	streetAddress: string;
	city: string;
	totalAmount: string;
	cartProducts: ICartProduct[];
	tran_id: string;
	paid: boolean;
	status: OrderStatusType;
	createdAt: Date;
	updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		userName: { type: String, required: true },
		userEmail: { type: String, required: true },
		phone: { type: String, required: true },
		streetAddress: { type: String, required: true },
		city: { type: String, required: true },
		totalAmount: { type: String, required: true },
		cartProducts: { type: [Object], required: true },
		tran_id: { type: String, required: true, unique: true, index: true },
		paid: { type: Boolean, default: false, required: true },
		status: {
			type: String,
			default: "Pending",
			enum: ["Pending", "Preparing", "Dispatched", "Delivered"],
			required: true,
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
		expireAfterSeconds: 3600,
		partialFilterExpression: { paid: false },
	},
);

export const Order = model<IOrder>("Order", OrderSchema);
