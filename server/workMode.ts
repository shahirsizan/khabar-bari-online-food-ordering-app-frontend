type modeType = "prod" | "dev";

let mode: modeType;
let frontend_base_url: string;
let backend_base_url: string;

mode = "prod" as modeType; // prod or dev

if (mode === "dev") {
	frontend_base_url = "http://localhost:5173";
	backend_base_url = "http://localhost:5000";
} else {
	frontend_base_url = "https://khabar-bari-frontend.vercel.app";
	backend_base_url = "https://khabar-bari-backend.onrender.com";
}

export { mode, frontend_base_url, backend_base_url };
