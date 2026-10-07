import jwt from "jsonwebtoken";
import { mode } from "../workMode.js";
import { IUser } from "../model/userModel.js";

interface CookieConfigOptions {
	httpOnly: boolean;
	secure: boolean;
	sameSite: "none" | "lax" | "strict";
	maxAge: number;
}

interface TokenPayload {
	accessToken: string;
	refreshToken: string;
}

/**
 * Generate cryptographic access tokens and background refresh tokens for sessions
 */
export const generateTokens = (user: IUser): TokenPayload => {
	const jwtSecret = process.env.JWT_SEC as string;

	const accessToken = jwt.sign(
		{ id: user._id.toString(), role: user.role },
		jwtSecret,
		{
			expiresIn: "15m",
		},
	);

	const refreshToken = jwt.sign({ id: user._id.toString() }, jwtSecret, {
		expiresIn: "3d",
	});

	return { accessToken, refreshToken };
};

export const cookieOptions: CookieConfigOptions = {
	httpOnly: true,
	secure: mode === "prod", // Required for cross-site (Vercel -> Render)
	sameSite: mode === "prod" ? "none" : "lax", // Required for cross-site cookies
	maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};
