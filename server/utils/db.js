import mongoose from "mongoose";
import "dotenv/config";

export const db = async () => {
	try {
		mongoose.connection.on("connected", () => {
			console.log("✅ Connected to Mongodb");
		});

		mongoose.connection.on("error", (err) => {
			console.log("❌ Error while connecting to Mongodb: " + err);
		});

		mongoose.connection.on("disconnected", () => {
			console.log("❌ Mongodb connection disconnected");
		});

		await mongoose.connect(process.env.db_url);
	} catch (error) {
		console.log("❌ mongodb connection failed: ", error.message);
	}
};
