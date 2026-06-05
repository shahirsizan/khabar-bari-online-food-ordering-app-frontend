import mongoose, { model, Schema } from "mongoose";

const MenuItemSchema = new Schema(
	{
		image: { type: String },
		name: { type: String },
		description: { type: String },
		basePrice: { type: Number },
	},
	{ timestamps: true },
);

export const MenuItem =
	mongoose.models?.MenuItem || model("MenuItem", MenuItemSchema);
