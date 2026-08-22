import mongoose from "mongoose";
import "dotenv/config";
import { mode } from "../workMode.js";

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

		await mongoose.connect(process.env.db_url, {
			/***
			 * Connection Pooling Options
			 */
			maxPoolSize: 100,
			minPoolSize: 30,
			maxIdleTimeMS: 20000,

			/***
			 * Timeout and Failure Safeguards
			 */
			serverSelectionTimeoutMS: 5000,
			connectTimeoutMS: 10000,
			socketTimeoutMS: 30000,

			/***
			 *Performance & Stability Adjustments
			 */
			autoIndex: mode === "prod" ? false : true, // Disable indexing in production
			bufferCommands: false, // Turn off query memory-buffering
			family: 4, // Force IPv4 lookup directly
		});
	} catch (error) {
		console.log("❌ mongodb connection failed: ", error.message);
	}
};
