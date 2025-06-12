const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const routes = require("./routes/routes.js");
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(
	cors({
		origin: "http://localhost:5173",
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

app.use("/", (req, res) => {
	res.send("hello from backend base url");
});
app.use("/api", routes);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
