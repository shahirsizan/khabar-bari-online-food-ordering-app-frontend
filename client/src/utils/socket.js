import { io } from "socket.io-client";
import { backend_base_url } from "../workMode";

// Initialize socket outside the component to prevent repeatative instance creation during component refreshes
// This runs only once when the file is imported, not on re-renders

export const initializeSocket = () => {
	return io(`${backend_base_url}`);
};
