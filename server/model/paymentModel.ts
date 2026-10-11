import mongoose, { Schema, Document } from "mongoose";

export interface IPayment {
	_id: mongoose.Types.ObjectId;
	userId?: number;
	amount?: number;
	trxID?: string;
	paymentID?: string;
	date?: string;
	createdAt: Date;
	updatedAt: Date;
}

const paymentSchema = new mongoose.Schema<IPayment>(
	{
		userId: {
			type: Number,
		},
		amount: {
			type: Number,
		},
		trxID: {
			type: String,
		},
		paymentID: {
			type: String,
		},
		date: {
			type: String,
		},
	},
	{ timestamps: true },
);

const paymentModel = mongoose.model<IPayment>("payments", paymentSchema);

export default paymentModel;
