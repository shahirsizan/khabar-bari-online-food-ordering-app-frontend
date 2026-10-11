import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, IUser } from "../model/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import { redisConnection } from "../utils/redis.js";
import { frontend_base_url } from "../workMode.js";
import { cookieOptions, generateTokens } from "../utils/token.js";
import { HydratedDocument } from "mongoose";

interface DecodedPayload extends jwt.JwtPayload {
	id: string;
	role: string;
}

export const registerUser: RequestHandler<
	{},
	{ message: string; userObj: Omit<IUser, "password"> } | { message: string },
	Pick<
		IUser,
		"name" | "email" | "password" | "phone" | "streetAddress" | "city"
	>,
	{}
> = async (req, res) => {
	try {
		const { name, email, password, phone, streetAddress, city } = req.body;

		// Input sanity check
		if (!email || !password || !name || !phone || !streetAddress || !city) {
			return res
				.status(400)
				.json({ message: "Missing required fields." });
		}

		/***
		 * Because of .select("-password"),
		 * MongoDB NEVER returns the password field from the database.
		 */
		let existingUser = await User.findOne({
			email: email.toLowerCase().trim(),
		})
			.select("-password")
			.lean<Omit<IUser, "password">>();

		if (existingUser) {
			res.status(400).json({
				message: "Email already exists!",
			});
			return;
		}

		const hashPassword = await bcrypt.hash(password, 10);

		const newUser = await User.create({
			name,
			email: email.toLowerCase().trim(),
			password: hashPassword,
			phone,
			streetAddress,
			city,
		});

		const userObj = newUser.toObject() as IUser;
		delete userObj.password;

		return res.status(201).json({
			message: "User Registered successfully",
			userObj: userObj,
		});

		// {"message":"User Registered successfully",
		// "user":{
		// 		"email":"abc@gmail.com",
		// 		"password":"$2b$10$cNeShLoaKjGAzMS9iAMn6eAnKPgBDXKEXONOwjfiPCdXuKAs2KBMe",
		// 		"_id":"69df738c24941cedf8c1b63e",
		// 		"createdAt":"2026-04-15T11:16:28.745Z",
		// 		"updatedAt":"2026-04-15T11:16:28.745Z",
		// 		"__v":0},
		// 		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Registration failed: ", error.message);
		}
		return res.status(500).json({ message: "Registration failed" });
	}
};

export const loginUser: RequestHandler<
	{},
	| { message: string; userObj: Omit<IUser, "password">; accessToken: string }
	| { message: string },
	Pick<IUser, "email" | "password">,
	{}
> = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "ইমেইল অথবা পাসওয়ার্ড মিসিং!" });
		}

		const user = await User.findOne({
			email: email.toLowerCase().trim(),
		}).lean<IUser>();

		if (!user) {
			return res.status(404).json({
				message: "এই ইমেইল আইডি সংশ্লিষ্ট কোনো আইডি পাওয়া যায়নি!",
			});
		}

		const passwordMatches = await bcrypt.compare(
			password,
			user.password as string,
		);

		if (!passwordMatches) {
			res.status(400).json({
				message: "ইনভ্যালিড পাসওয়ার্ড!",
			});
			return;
		}
		const { accessToken, refreshToken } = generateTokens(user);

		const userObj = user as IUser;
		delete userObj.password;

		/***
		 * Send Refresh Token in secure cookie
		 */
		res.cookie("refreshToken", refreshToken, cookieOptions);

		return res.status(200).json({
			message: "লগইন সফল হয়েছে!",
			userObj: userObj,
			accessToken: accessToken,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("লগইন প্রক্রিয়া ব্যর্থ হয়েছে: ", error.message);
		}
		return res.status(500).json({ message: "লগইন প্রক্রিয়া ব্যর্থ হয়েছে" });
	}
};

export const logout: RequestHandler<{}, { message: string }, {}, {}> = (
	req,
	res,
) => {
	res.clearCookie("refreshToken", cookieOptions);
	return res.status(200).json({ message: "লগআউট সফল হয়েছে!" });
};

export const generateAccessTokenUsingRefreshToken: RequestHandler<
	{},
	{ accessToken: string } | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		/***
		 * Walkthrough:
		 * 1. RT, upon decoding, gives us user id
		 * 2. We fetch user from DB with that id.
		 * 3. We generate new AT using users info
		 * 4. Send new AT through response.
		 * 5. No need to send RT as it is already in the browsers cookie,
		 */

		const currentRefreshToken = req.cookies?.refreshToken as
			| string
			| undefined;

		if (!currentRefreshToken) {
			return res.status(401).json({ message: "রিফ্রেশ টোকেন মিসিং!" });
		}

		const jwtSecret = process.env.JWT_SEC as string;
		/***
		 * /Promisify token operations to prevent async racing
		 */
		const decodedPayload = await new Promise<DecodedPayload>(
			(resolve, reject) => {
				jwt.verify(currentRefreshToken, jwtSecret, (error, decoded) => {
					if (error) {
						/***
						 * When a promise rejects, it throws an unhandled rejection
						 * to the application's try/catch block
						 */
						return reject(new Error("Invalid refresh token!"));
					} else {
						return resolve(decoded as DecodedPayload);
					}
				});
			},
		);

		/***
		 * Get the related user of the `refresh token` and
		 * generate a new `access token` and set to cookie.
		 */
		const user = await User.findById(decodedPayload.id).lean<IUser>();
		if (!user) {
			return res.status(404).json({ message: "ইউজার পাওয়া যায়নি!" });
		}

		const newAccessToken = jwt.sign(
			{ id: user._id, role: user.role },
			jwtSecret,
			{ expiresIn: "15m" },
		);

		return res.status(200).json({ accessToken: newAccessToken });
	} catch (error: unknown) {
		/***
		 * Clear invalid/expired cookie from browser immediately
		 */
		res.clearCookie("refreshToken", cookieOptions);
		return res.status(401).json({
			message:
				"Invalid or expired refresh token. Browser refreshToken hase been deleted.",
		});
	}
};

export const forgotPassword: RequestHandler<
	{},
	{ success: boolean; message: string } | { message: string },
	{ email: string },
	{}
> = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: "যথাযথ ইমেইল ইনপুট দিন!" });
		}

		const user = await User.findOne({ email: email.toLowerCase().trim() });

		if (!user) {
			return res
				.status(404)
				.json({ message: "এই ইমেইল সংশ্লিষ্ট কোনো আইডি পাওয়া যায়নি!" });
		}

		/***
		 * Redis required for this controller
		 */
		if (!redisConnection) {
			console.log("Redis instance required, but unavailable!");
			return res.status(500).json({
				message: "সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।",
			});
		}

		// 1. Generate a hashed reset token
		const hashedResetToken = await bcrypt.hash(Date.now().toString(), 2); // Using current timestamp as a unique value
		const uriSafeToken = encodeURIComponent(hashedResetToken);
		// 2. Set reset token to expire in 10 minutes
		// format: (key) password_reset:<hashedToken> -> (value) user.email

		await redisConnection.set(
			`password_reset_token:${hashedResetToken}`,
			user.email,
			"EX",
			600,
		);

		// 3. Create URL(Will redirect to frontend) with resetToken embedded
		const resetUrl = `${frontend_base_url}/reset-password-after-link?resetToken=${uriSafeToken}`;
		// console.log("resetUrl: ", resetUrl);
		const message = `You received this email because you have requested a password reset.\n\nPlease click the link below within 10 minutes to reset your password:\n\n${resetUrl}`;

		sendEmail({
			// for free tier usage, only the khabarbari email can be used.
			// email: user.email,
			email: "khabarbari.restaurant125@gmail.com",
			subject: "Password Reset Request - Khabar Bari",
			message: message,
		});

		res.status(200).json({
			success: true,
			message: "Email sent successfully.",
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("forgotPassword() error: ", error.message);
			return res.status(500).json({
				message: error.message,
			});
		}
		return res.status(500).json({
			message: "forgotPassword() error.",
		});
	}
};

/***
 * Continuation of the above `forgotPassword` controller...
 */
export const resetPasswordWithToken: RequestHandler<
	{},
	{ success: boolean; message: string } | { message: string },
	{ resetToken?: string; password?: string },
	{}
> = async (req, res) => {
	try {
		const { resetToken, password } = req.body;
		const hashedResetToken = resetToken;
		// console.log("hashedResetToken: ", hashedResetToken);

		if (!hashedResetToken || !password) {
			return res
				.status(400)
				.json({ message: "রিসেট টোকেন অথবা পাসওয়ার্ডে ভুল আছে!" });
		}

		const rawResetToken = decodeURIComponent(hashedResetToken);

		const redisKey = `password_reset_token:${rawResetToken}`;

		if (!redisConnection) {
			console.log("Redis instance required, but unavailable!");
			return res.status(500).json({
				message: "সমস্যা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।",
			});
		}

		/***
		 * 1. Fetch user email from Redis
		 */
		const userEmail = (await redisConnection.get(redisKey)) as string;

		if (!userEmail) {
			return res.status(400).json({
				message:
					"রিসেট টোকেন এক্সপায়ারড। নতুন রিসেট টোকেন দিয়ে পুনরায় চেষ্টা করুন।",
			});
		}

		/***
		 * 2. Find user in DB and update password.
		 * Don't use `lean()` here as it will prevent us from using `save()` below!
		 */
		const user = await User.findOne({
			email: userEmail.toLowerCase().trim(),
		});

		if (!user) {
			return res
				.status(400)
				.json({ message: "এই ইমেইল সংশ্লিষ্ট কোনো আইডি পাওয়া যায়নি!" });
		}

		const givenPlainPassword = password;
		const hashedPassword = await bcrypt.hash(givenPlainPassword, 10);
		user.password = hashedPassword;
		await user.save();

		/***
		 * 3. Delete reset token from Redis to prevent reuse.
		 */
		await redisConnection.del(redisKey);

		res.status(200).json({
			success: true,
			message: "আপনার পাসওয়ার্ড রিসেট সফল হয়েছে।",
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("resetPasswordWithToken() error: ", error.message);
			return res.status(500).json({
				message: error.message,
			});
		}
		return res.status(500).json({
			message: "resetPasswordWithToken() error.",
		});
	}
};

/**
 * Update password while logged in
 */
export const updatePasswordWhenLoggedIn: RequestHandler<
	{},
	{ success: boolean; message: string } | { message: string },
	{ oldPassword?: string; newPassword?: string },
	{}
> = async (req, res) => {
	try {
		if (!req.user) {
			console.log("req.user not found!");
			return res.status(401).json({ message: "অনুগ্রহ করে লগইন করুন!" });
		}

		const { oldPassword, newPassword } = req.body;
		if (!oldPassword || !newPassword) {
			return res.status(400).json({
				message: "পুরাতন এবং নতুন পাসওয়ার্ড ঠিকমত ইনপুট দিন!",
			});
		}

		/***
		 * Because the below query does not use .lean(), the result is a fully functional,
		 * "hydrated" Mongoose document. But if we type assert using `as IUser`, it will give us
		 * plain object that only satisfied the specified schema properties. It dumps the Mongoose instance methods.
		 *
		 * To fix this, we need to cast the variable using Mongoose's built-in HydratedDocument<T> type wrapper.
		 * This informs TypeScript that the result adheres to our custom data type and includes all standard
		 * Mongoose document operations.
		 */
		const user = (await User.findById(req.user._id).select(
			"+password",
		)) as HydratedDocument<IUser> | null;

		if (!user) {
			return res
				.status(404)
				.json({ message: "এই ইমেইল সংশ্লিষ্ট কোনো আইডি পাওয়া যায়নি!" });
		}

		const doesOldPasswordMatch = await bcrypt.compare(
			oldPassword,
			user.password as string,
		);

		if (!doesOldPasswordMatch) {
			return res.status(400).json({
				message: "আপনার পুরাতন পাসওয়ার্ড সঠিকভাবে ইনপুট দিন।",
			});
		}

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		res.status(200).json({
			success: true,
			message: "পাসওয়ার্ড পরিবর্তন সফল হয়েছে!",
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("updatePasswordWhenLoggedIn() error: ", error.message);
			return res.status(500).json({
				message: error.message,
			});
		}
		return res.status(500).json({
			message: "resetPasswordWithToken() error.",
		});
	}
};
