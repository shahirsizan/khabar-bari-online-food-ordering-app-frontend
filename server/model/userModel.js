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
		},
		streetAddress: {
			type: String,
		},
		city: {
			type: String,
		},
		role: {
			type: String,
			default: "user",
		},
	},
	{
		timestamps: true,
	},
);

export const User = mongoose.model("User", schema);
