import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	password?: string; // Optional because we'll omit it in auth middleware.
	phone: string;
	streetAddress: string;
	city: string;
	role: "user" | "admin";
	createdAt: Date;
	updatedAt: Date;
}

const schema = new Schema<IUser>(
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
			enum: ["admin", "user"],
			default: "user",
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export const User = mongoose.model<IUser>("User", schema);
