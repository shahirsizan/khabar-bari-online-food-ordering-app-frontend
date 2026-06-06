import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../model/userModel.js";

export const registerUser = async (req, res) => {
	try {
		const { name, email, password, phone, streetAddress, city } = req.body;
		let user = await User.findOne({ email });

		if (user) {
			res.status(400).json({
				message: "⚠️ User already exists!",
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
			message: "✅ User Registered",
			userObj,
		});

		// {"message":"✅ User Registered",
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
			message: "❌ User doesn't exist",
		});
		return;
	}

	const passwordMatches = await bcrypt.compare(password, user.password);

	if (!passwordMatches) {
		res.status(400).json({
			message: "❌ Invalid Password",
		});
		return;
	}

	const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
		expiresIn: "1d",
	});

	const userObj = user.toObject();
	delete userObj.password;

	res.status(200).json({
		message: "✅ Logged in successfully",
		userObj,
		token,
	});
};

// export const myProfile = async (req, res) => {
// 	const user = req.user;
// 	console.log("userService -> myProfile() -> user: ", user);
// 	res.status(200).json(user);
// };
