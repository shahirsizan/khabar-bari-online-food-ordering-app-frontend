import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let ioInstance: Server | null = null;

export const initIO = (
	httpServer: HttpServer,
	allowedOrigins: string | string[],
): Server => {
	ioInstance = new Server(httpServer, {
		cors: {
			origin: allowedOrigins,
			methods: ["GET", "POST"],
		},
	});

	return ioInstance;
};

export const getIO = (): Server => {
	if (!ioInstance) {
		throw new Error("Socket.io not initialized!");
	}

	return ioInstance;
};
