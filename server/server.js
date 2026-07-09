import { mode, frontend_base_url } from "./workMode.js";

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/routes.js";
import "dotenv/config";
import slidingWindowLimiter from "./middleware/rateLimiter.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { Message } from "./model/Message.js";

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
	"http://localhost:5173",
	"https://khabar-bari-frontend.vercel.app",
	"https://tokenized.sandbox.bka.sh",
];
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
		// allowedHeaders: ["Content-Type", "token", "Authorization"],
	}),
);

// Initializing Socket.io with CORS
const io = new Server(httpServer, {
	cors: {
		origin: `${frontend_base_url}`,
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	// console.log("A user connected: ", socket.id);

	// 1. when user joins a specific room
	socket.on("join_room", (roomId) => {
		socket.join(roomId);
		console.log(`User ${socket.id} connected to room ${roomId}`);
	});

	// 2. handle messages
	socket.on("send_message", async (data) => {
		const { roomId, senderId, senderRole, text } = data;

		try {
			// fisrt save to database
			const newMessage = await Message.create({
				roomId,
				senderId,
				senderRole,
				text,
			});

			// then broadcast back to everyone (including sender) in the room
			io.to(roomId).emit("receive_message", newMessage);
		} catch (error) {
			console.error("Error saving message: ", error.message);
		}
	});

	// 3. on disconnect
	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

const db = async () => {
	try {
		mongoose.connection.on("connected", () => {
			console.log("Connected to database sucessfully");
		});

		mongoose.connection.on("error", (err) => {
			console.log("Error while connecting to database :" + err);
		});

		mongoose.connection.on("disconnected", () => {
			console.log("Mongodb connection disconnected");
		});

		await mongoose.connect(process.env.db_url);
	} catch (error) {
		console.log("❌ mongodb connection failed: ", error.message);
	}
};

app.use(slidingWindowLimiter(15000, 15));
app.use("/api", router);
app.use("/", (req, res) => {
	res.send("cron hit");
});

httpServer.listen(port, () => {
	db();
	console.log(`Listening port ${port} in ${mode} mode`);
});
