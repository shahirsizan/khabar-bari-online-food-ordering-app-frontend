import jwt from "jsonwebtoken";
import { User } from "../model/userModel.js";
import { NextFunction, Request, Response } from "express";

/***
 * Because of our express.d.ts declaration, typing `req: Request` lets us
 * safely write `req.user = userObj` without causing compilation errors.
 *
 * Since this middleware is async, the wrapper must return a Promise.
 * The promise resolves to either a Response (if validation fails and
 * returns an error response) or void (when it passes and calls next()
 * to pass control to next controller).
 */

interface DecodedToken extends jwt.JwtPayload {
	id: string;
}

export const isAuth = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void | Response> => {
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

		const decodedValue = jwt.verify(
			token,
			process.env.JWT_SEC as string,
		) as DecodedToken;

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

		if (!user) {
			return res.status(401).json({
				message: "❌ User Not found. Please Login",
			});
		}

		const userObj = user.toObject();
		/***
		 * From global Request namespace, TS knows that `req.user` contains `password`.
		 * We could have simply wrote: delete userObj.password.
		 * But the below code is just for practice demo in case if password was really omitted from the type.
		 * We tell TypeScript to temporarily treat `userObj` as an object that might
		 * contain a `password` so it can delete it for sure.
		 */
		// Check: const userobjjj = userObj as { password?: string };
		delete (userObj as { password?: string }).password;

		/***
		 * Append `userObj` object to the req and delegate to next controller
		 */
		req.user = userObj;
		next();
	} catch (error: unknown) {
		/***
		 * 403 would be okay, but we'll send 401 for unauthorized
		 */
		if (error instanceof Error) {
			res.status(401).json({
				message: error.message,
			});
		}
	}
};
