import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";

export const isAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader?.startsWith("Bearer ")) {
			/***
			 * 401 for unauthorized
			 */
			return res.status(401).json({
				message: "⚠️ No token. Please Login",
			});
		}

		const token = authHeader.split(" ")[1];

		const decodedValue = jwt.verify(token, process.env.JWT_SEC);

		if (!decodedValue) {
			/***
			 * 401 for unauthorized
			 */
			return res.status(401).json({
				message: "❌ Invalid token. Please Login",
			});
		}

		const userId = decodedValue.id;
		const user = await User.findById(userId);
		const userObj = user?.toObject();
		delete userObj?.password;

		if (!userObj) {
			/***
			 * 401 for unauthorized
			 */
			return res.status(401).json({
				message: "❌ User Not found. Please Login",
			});
		}

		/***
		 * Append `userObj` object to the req and delegate to next controller
		 */
		req.user = userObj;
		next();
	} catch (error) {
		/***
		 * 403 would be okay, but we'll send 401 for unauthorized
		 */
		res.status(401).json({
			message: error.message,
		});
	}
};
