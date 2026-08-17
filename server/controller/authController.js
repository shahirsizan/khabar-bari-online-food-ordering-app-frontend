import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../model/userModel.js";
import sendEmail from "../utils/sendEmail.js";
import redis from "../utils/redis.js";
import { frontend_base_url } from "../workMode.js";

export const registerUser = async (req, res) => {
	try {
		const { name, email, password, phone, streetAddress, city } = req.body;
		let user = await User.findOne({ email });

		if (user) {
			res.status(400).json({
				message: "Email already exists!",
			});
			return;
		}

		const hashPassword = await bcrypt.hash(password, 10);

		user = await User.create({
			name,
			email,
			password: hashPassword,
			phone,
			streetAddress,
			city,
		});

		const userObj = user.toObject();
		delete userObj.password;

		res.status(201).json({
			message: "User Registered successfully",
			userObj,
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
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};

export const loginUser = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		res.status(404).json({
			message: "User with the email doesn't exist",
		});
		return;
	}

	const passwordMatches = await bcrypt.compare(password, user.password);

	if (!passwordMatches) {
		res.status(400).json({
			message: "Invalid password",
		});
		return;
	}

	const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
		expiresIn: "1d",
	});

	const userObj = user.toObject();
	delete userObj.password;

	res.status(200).json({
		message: "Logged in successfully",
		userObj,
		token,
	});
};

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });

		if (!user) {
			return res
				.status(404)
				.json({ error: "No user found with this email address." });
		}

		// 1. Generate a hashed reset token
		const hashedResetToken = await bcrypt.hash(Date.now().toString(), 2); // Using current timestamp as a unique value

		// 2. Set reset token to expire in 10 minutes
		// format: (key) password_reset:<hashedToken> -> (value) user.email
		await redis.set(
			`password_reset_token:${hashedResetToken}`,
			user.email,
			"EX",
			600,
		);

		// 3. Create URL(Will redirect to frontend) with resetToken embedded
		const resetUrl = `${frontend_base_url}/reset-password-after-link?resetToken=${hashedResetToken}`;

		// console.log("resetUrl: ", resetUrl);

		const message = `You received this email because you have requested a password reset.\n\nPlease click the link below within 10 minutes to reset your password:\n\n${resetUrl}`;

		await sendEmail({
			email: user.email,
			subject: "Password Reset Request - Khabar Bari",
			message: message,
		});

		res.status(200).json({
			success: true,
			message: "Email sent successfully.",
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const resetPasswordWithToken = async (req, res) => {
	try {
		const hashedResetToken = req.body.resetToken;
		// console.log("hashedResetToken: ", hashedResetToken);

		const redisKey = `password_reset_token:${hashedResetToken}`;
		// 1. Fetch user email from Redis
		const userEmail = await redis.get(redisKey);

		if (!userEmail) {
			return res
				.status(400)
				.json({ error: "Invalid or expired password reset token." });
		}

		// 2. Find user in DB and update password
		const user = await User.findOne({ email: userEmail });
		if (!user) {
			return res.status(400).json({ error: "User doesn't exists." });
		}
		const givenPlainPassword = req.body.password;
		const hashedPassword = await bcrypt.hash(givenPlainPassword, 10);
		user.password = hashedPassword;
		await user.save();

		// 3. Delete reset token from Redis to prevent reuse.
		await redis.del(redisKey);

		res.status(200).json({
			success: true,
			message: "আপনার পাসওয়ার্ড রিসেট সফল হয়েছে।",
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

export const updatePasswordWhenLoggedIn = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;

		const user = await User.findById(req.user._id).select("+password");

		const isMatch = await bcrypt.compare(oldPassword, user.password);

		if (!isMatch) {
			return res
				.status(400)
				.json({ error: "আপনার আগের পাসওয়ার্ড সঠিকভাবে ইনপুট দিন।" });
		}

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		res.status(200).json({
			success: true,
			message: "পাসওয়ার্ড পরিবর্তন সফল হয়েছে!",
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
