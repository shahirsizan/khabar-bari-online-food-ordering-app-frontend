import { IUser } from "../model/userModel.js";

declare global {
	namespace Express {
		interface Request {
			user?: IUser;
		}
	}
}
