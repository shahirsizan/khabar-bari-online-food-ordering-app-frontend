import "dotenv/config";
import { mode } from "./workMode.js";
import express from "express";
import mongoose, { Mongoose } from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./routes/routes.js";
import slidingWindowLimiter from "./middleware/rateLimiter.js";
import "./utils/redis.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { Message } from "./model/Message.js";
import { initIO } from "./utils/io.js";
import { Notification } from "./model/NotificationModel.js";
import { User } from "./model/userModel.js";
import { db } from "./utils/db.js";
import { initAuditWorker } from "./utils/auditWorker.js";
import { v2 as cloudinary } from "cloudinary";

interface SocketUserPresence {
	_id: string;
	role: "admin" | "user";
}

interface SocketTrackingInfo {
	socketId: string;
	role: "admin" | "user";
}

interface SocketMessagePayload {
	roomId: string;
	roomName: string;
	senderId: string;
	senderRole: "admin" | "user";
	text: string;
}

const app = express();
/***
 * This is important for Audit Logs.
 * The result: req.ip will now return the real client IP address instead of our proxy's IP.
 * Without this, every log entry will show the same IP address (Our proxy's),
 * rendering the ipAddress field useless.
 * Client (Real User) ──> Reverse Proxy (Nginx/Cloudflare) ──> Express App
 * `1` -> Trust only the first upstream proxy hop (Perfect for Nginx, Heroku, or Render).
 */
app.set("trust proxy", 1);
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
app.use(express.json());
app.use(cookieParser());
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

/***
 * Initialize Cloudinary (No need to store the return value)
 * Because it configures a global singleton instance, the best practice in Node.js/Express
 * is to call cloudinary.config() once in server.ts right after the environment variables load.
 * Once done, we can simply import { v2 as cloudinary } anywhere else in our project and start
 * uploading instantly without needing to configure it over and over again.
 */
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
	api_key: process.env.CLOUDINARY_API_KEY as string,
	api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Initializing Socket.io once here
const io = initIO(httpServer, allowedOrigins);

/***
 * Start BullMQ background worker
 */
initAuditWorker();

/***
 * SocketIO controllers
 */
// Map to track online users: Key = userId, Value = { socketId, role}
// typed Map instance: Key = userId (string), Value = SocketTrackingInfo object
const onlineUsers = new Map<string, SocketTrackingInfo>();
io.on("connection", (socket) => {
	// Triggered as soon as any user lands on the app
	socket.on("register_presence", ({ user }: { user: SocketUserPresence }) => {
		if (!user) {
			return;
		}

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
	socket.on("join_room", ({ roomId }: { roomId: string }) => {
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
		const onlineIds: string[] = [];
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
	socket.on("send_message", async (data: SocketMessagePayload) => {
		const { roomId, roomName, senderId, senderRole, text } = data;

		/***
		 * console.log(typeof roomId);		string   
			console.log(typeof roomName);		string
			console.log(typeof senderId);		string
			console.log(typeof senderRole);		string
			console.log(typeof text);		string
		 */

		try {
			/***
			 * 1️⃣ save message in database
			 */
			const newMessage = await Message.create({
				roomId: roomId,
				roomName: roomName,
				senderId: new mongoose.Types.ObjectId(senderId),
				senderRole: senderRole,
				text: text,
			});

			//
			/***
			 * console.log("newMessage: ", newMessage);
			 * newMessage:  {
					roomId: '6a77417f8cb5f9007e9e40ea',
					roomName: 'Shahir Adil Sizan',
					senderId: new ObjectId('6a1aa54fddae3a9044191424'),
					senderRole: 'admin',
					text: '23432',
					_id: new ObjectId('6a82ea9cb54d25198837a4db'),
					createdAt: 2026-08-17T11:03:56.093Z,
					updatedAt: 2026-08-17T11:03:56.093Z,
					__v: 0
					}
			 */

			/***
			 * 2️⃣ broadcast message back to everyone (including sender) in the room
			 */
			io.to(roomId).emit("receive_message", newMessage);

			/***
			 * 3️⃣ generate notification,
			 * persist in DB and
			 * send through socket.
			 */
			if (senderRole === "user") {
				/***
				 * User -> Admin
				 * */
				const adminUser = await User.findOne({ role: "admin" });

				// Critical safety fallback validation to prevent crashing server on missing admin
				if (adminUser) {
					const adminNotification = await Notification.create({
						message: `You got a message from ${roomName}`,
						isRead: false,
						link: `/profile/chats/${roomId}`,
						recipientId: adminUser._id,
						type: "chat",
					});

					socket
						.to("admin_room")
						.emit("new_chat_notification", adminNotification);
				}
			} else if (senderRole === "admin") {
				/***
				 * Admin -> User
				 * */
				const userNotification = await Notification.create({
					message: `You got a message from Admin`,
					isRead: false,
					// Added link so `markSeveralChatNotificationsAsRead` controller works for user too
					link: `/profile/chats/${roomId}`,
					recipientId: new mongoose.Types.ObjectId(roomId),
					type: "chat",
				});

				//
				/***
				 * console.log("userNotification", userNotification);
				 * userNotification {
						message: 'You received a message from Admin',
						isRead: false,
						link: '/profile/chats/6a77417f8cb5f9007e9e40ea',
						recipientId: new ObjectId('6a77417f8cb5f9007e9e40ea'),
						type: 'chat',
						_id: new ObjectId('6a82ea9cb54d25198837a4dd'),
						createdAt: 2026-08-17T11:03:56.156Z,
						updatedAt: 2026-08-17T11:03:56.156Z,
						__v: 0
						}
				 */

				socket
					.to(roomId)
					.emit("new_chat_notification", userNotification);
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error("Error saving message: ", error.message);
			}
		}
	});

	// On disconnect
	socket.on("disconnect", () => {
		let disconnectedUserId: string | null = null;
		let disconnectedUserRole: "admin" | "user" | null = null;

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

app.use(slidingWindowLimiter(10000, 25));
app.use("/api", router);
app.use("/", (req, res) => {
	res.send("cron hit");
});

httpServer.listen(port, () => {
	db();
	console.log(`✅ Listening port ${port} in ${mode} mode`);
});
