import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const isAuth = async (req, res, next) => {
	try {
		const token = req.headers.token;
		// console.log("🔍 Token received in middleware:", token);

		if (!token) {
			res.status(403).json({
				message: "⚠️ No token. Please Login",
			});
			return;
		}

		// console.log(
		// 	"🔑 Secret being used:",
		// 	process.env.JWT_SEC ? "Loaded" : "MISSING",
		// );
		const decodedValue = jwt.verify(token, process.env.JWT_SEC);

		if (!decodedValue || !decodedValue._id) {
			res.status(403).json({
				message: "❌ Invalid token. Please Login",
			});
			return;
		}

		const userId = decodedValue._id;
		const user = await User.findById(userId);
		const userObj = user?.toObject();
		delete userObj?.password;

		if (!userObj) {
			res.status(403).json({
				message: "❌ User Not found. Please Login",
			});

			return;
		}

		// Append `userObj` object to the req and delegate to next controller
		req.user = userObj;

		next();
	} catch (error) {
		res.status(403).json({
			message: error.message,
		});
	}
};
