import { mode, frontend_base_url } from "./workMode.js";
import express from "express";
import mongoose, { Mongoose } from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/routes.js";
import "dotenv/config";
import slidingWindowLimiter from "./middleware/rateLimiter.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { Message } from "./model/Message.js";
import { getIO, initIO } from "./utils/io.js";
import { Notification } from "./model/NotificationModel.js";
import { User } from "./model/userModel.js";
import { db } from "./utils/db.js";

const app = express();
const port = process.env.PORT || 5000;
const httpServer = createServer(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [frontend_base_url, "https://tokenized.sandbox.bka.sh"];
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
		// allowedHeaders: ["Content-Type", "token", "Authorization"],
	}),
);

// Initializing Socket.io once here
const io = initIO(httpServer, allowedOrigins);

/***
 * SocketIO controllers
 */
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

				const adminNotification = await Notification.create({
					message: `You received a message from ${roomName}`,
					isRead: false,
					link: `/profile/chats/${roomId}`,
					recipientId: adminUser._id,
					type: "chat",
				});

				socket
					.to("admin_room")
					.emit("new_chat_notification", adminNotification);
			} else if (senderRole === "admin") {
				/***
				 * Admin -> User
				 * */
				const userNotification = await Notification.create({
					message: `You received a message from Admin`,
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

app.use(slidingWindowLimiter(15000, 15));
app.use("/api", router);
app.use("/", (req, res) => {
	res.send("cron hit");
});

httpServer.listen(port, () => {
	db();
	console.log(`✅ Listening port ${port} in ${mode} mode`);
});
