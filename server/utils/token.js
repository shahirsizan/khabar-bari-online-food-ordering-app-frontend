import jwt from "jsonwebtoken";
import { mode } from "../workMode.js";

export const generateTokens = (user) => {
	const accessToken = jwt.sign(
		{ id: user._id, role: user.role },
		process.env.JWT_SEC,
		{ expiresIn: "15m" },
	);

	const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SEC, {
		expiresIn: "3d",
	});

	return { accessToken, refreshToken };
};

export const cookieOptions = {
	httpOnly: true,
	secure: mode === "prod", // Required for cross-site (Vercel -> Render)
	sameSite: mode === "prod" ? "none" : "lax", // Required for cross-site cookies
	maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
};
