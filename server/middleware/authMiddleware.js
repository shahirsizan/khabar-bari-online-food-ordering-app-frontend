import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const isAuth = async (req, res, next) => {
	try {
		const token = req.headers.token;
		// console.log("🔍 Token received in middleware:", token);

		if (!token) {
			// 401 for unauthorized
			res.status(401).json({
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
			// 401 for unauthorized
			res.status(401).json({
				message: "❌ Invalid token. Please Login",
			});
			return;
		}

		const userId = decodedValue._id;
		const user = await User.findById(userId);
		const userObj = user?.toObject();
		delete userObj?.password;

		if (!userObj) {
			// 401 for unauthorized
			res.status(401).json({
				message: "❌ User Not found. Please Login",
			});

			return;
		}

		// Append `userObj` object to the req and delegate to next controller
		req.user = userObj;

		next();
	} catch (error) {
		// 403 would be okay, but we'll send 401 for unauthorized
		res.status(401).json({
			message: error.message,
		});
	}
};
