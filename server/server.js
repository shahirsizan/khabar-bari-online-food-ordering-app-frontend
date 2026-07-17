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
import { initIO } from "./utils/io.js";

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

// Initializing Socket.io once here
const io = initIO(httpServer, frontend_base_url);

// Map to track online users: Key = userId, Value = { socketId, role}
const onlineUsers = new Map();
io.on("connection", (socket) => {
	// Triggered as soon as any user lands on the app
	socket.on("register_presence", ({ user }) => {
		onlineUsers.set(user._id, { socketId: socket.id, role: user.role });

		if (user.role === "admin") {
			// notify all non-admin users that admin is online
			socket.broadcast.emit("admin_status", { status: "online" });
		} else {
			// notify admin that this user is online
			socket.broadcast.emit("user_status_change", {
				userId: user._id,
				status: "online",
			});
		}
	});

	// Triggered when a user joins a room.
	socket.on("join_room", ({ roomId }) => {
		socket.join(roomId);
	});

	// Triggered to sync the non-admin users support buttons online indicator on mount.
	socket.on("check_admin_status", () => {
		let isAdminActive = false;
		for (let [id, connectedUser] of onlineUsers.entries()) {
			if (connectedUser.role === "admin") {
				isAdminActive = true;
				break;
			}
		}
		socket.emit("admin_status", {
			status: isAdminActive ? "online" : "offline",
		});
	});

	// Triggered to sync the Admin Sidebar on mount.
	socket.on("get_online_users", () => {
		const onlineIds = [];
		// Key = userId, Value = { socketId, role}
		for (let [id, connectedUser] of onlineUsers.entries()) {
			// populate the map with non-admin entries.
			if (connectedUser.role !== "admin") {
				onlineIds.push(id);
			}
		}
		socket.emit("initial_online_list", onlineIds);
	});

	// Handle messages
	socket.on("send_message", async (data) => {
		const { roomId, roomName, senderId, senderRole, text } = data;

		try {
			// fisrt save to database
			const newMessage = await Message.create({
				roomId,
				roomName,
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

	// On disconnect
	socket.on("disconnect", () => {
		let disconnectedUserId = null;
		let disconnectedUserRole = null;

		// Find which user belonged to this socket instance
		for (let [id, connectedUser] of onlineUsers.entries()) {
			if (connectedUser.socketId === socket.id) {
				disconnectedUserId = id;
				disconnectedUserRole = connectedUser.role;
				onlineUsers.delete(id); // Remove from live tracker
				break;
			}
		}

		if (!disconnectedUserId) {
			return;
		}

		if (disconnectedUserRole === "admin") {
			// Tell all users the admin got offline.
			socket.broadcast.emit("admin_status", { status: "offline" });
		} else {
			// Broadcast globally so the Admin panel catches the offline status
			socket.broadcast.emit("user_status_change", {
				userId: disconnectedUserId,
				status: "offline",
			});
		}
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
