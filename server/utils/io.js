import { Server } from "socket.io";

let ioInstance = null;

export const initIO = (httpServer, frontendUrl) => {
	ioInstance = new Server(httpServer, {
		cors: {
			origin: frontendUrl,
			methods: ["GET", "POST"],
		},
	});

	return ioInstance;
};

export const getIO = () => {
	if (!ioInstance) {
		throw new Error("Socket.io not initialized!");
	}

	return ioInstance;
};
