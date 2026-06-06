import mongoose, { Document, Schema } from "mongoose";

const schema = new Schema(
	{
		name: { type: String, required: true },
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		streetAddress: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			default: "user",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export const User = mongoose.model("User", schema);
