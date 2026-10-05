import mongoose, { Schema } from "mongoose";

export interface IMenuItem {
	_id: mongoose.Types.ObjectId;
	image?: string;
	name?: string;
	description?: string;
	basePrice?: number;
	createdAt: Date;
	updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
	{
		image: { type: String },
		name: { type: String },
		description: { type: String },
		basePrice: { type: Number },
	},
	{ timestamps: true },
);

export const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
