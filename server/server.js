import { mode, frontend_base_url } from "./workMode.js";

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./routes/routes.js";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());

const allowedOrigins = [
	"https://khabar-bari-frontend.vercel.app",
	"https://tokenized.sandbox.bka.sh",
];
app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);

const db = async () => {
	try {
		await mongoose.connect(process.env.db_url);
		console.log("db connected");
	} catch (error) {
		console.log(error.message);
	}
};

db();

// app.use("/", (req, res) => {
// 	res.send("hello from backend base url");
// });
// caution, uporer "/" uncomment korle browser theke call always upore captured hobe. Nicher "/api" te jabe na!

app.use("/api", router);

app.listen(port, () =>
	console.log(`Listening on port ${port} in ${mode} mode`)
);
