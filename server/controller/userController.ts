import { RequestHandler } from "express";
import { IUser, User } from "../model/userModel.js";

export const getAllUsers: RequestHandler<
	{},
	Omit<IUser, "password">[] | { message: string },
	{},
	{}
> = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not admin." });
	}

	try {
		const users = await User.find().select("-password").lean();
		console.log("Dang!");

		res.status(200).json(users);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error in getAllUsers:", error.message);
			res.status(500).json({
				message: error.message,
			});
		} else {
			res.status(500).json({
				message: "An unexpected error occured.",
			});
		}
	}
};

export const getUser: RequestHandler<
	{ id: string },
	Omit<IUser, "password"> | { message: string },
	{},
	{}
> = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not admin." });
	}

	const { id } = req.params;

	try {
		const user: Omit<IUser, "password"> | null = await User.findById(id)
			.select("-password")
			.lean();

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error in getUser:", error.message);
			res.status(500).json({
				message: error.message,
			});
		} else {
			res.status(500).json({
				message: "An unexpected error occured.",
			});
		}
	}
};

export const updateProfile: RequestHandler<
	{ id: string },
	{ message: string; user: Omit<IUser, "password"> } | { message: string },
	{
		originalObject: Omit<IUser, "password">;
		userName: string;
		phone: string;
		streetAddress: string;
		city: string;
		role: string;
	},
	{}
> = async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ message: "Access denied" });
	}

	try {
		if (
			req.user.role !== "admin" &&
			req.user._id.toString() !== req.body.originalObject._id.toString()
		) {
			return res.status(403).json({ message: "Access denied" });
		}

		const { originalObject, userName, phone, streetAddress, city, role } =
			req.body;

		// 2. Extract user info populated by your isAuth middleware
		const { _id, email } = originalObject;

		/***
		 * If I only need to read the data and do not need to modify a Mongoose document AFTER fetching it,
		 * use the .lean() option DIRECTLY in the query instead of calling .toObject() AFTERWARD.
		 * It prevents Mongoose from ever creating the heavy document instance in the first place,
		 * making queries up to 4x faster.
		 */
		const userDoc = (await User.findOneAndUpdate(
			{ email: req.user.role === "admin" ? email : req.user.email },
			{
				name: userName,
				phone: phone,
				streetAddress: streetAddress,
				city: city,
				role: req.user.role === "admin" ? role : req.user.role,
			},
			{ new: true }, // Returns the modified document
		)
			.select("-password")
			.lean()) as Omit<IUser, "password"> | null;

		if (!userDoc) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.status(200).json({
			message: "প্রোফাইল আপডেট প্রক্রিয়া সফল হয়েছে।",
			user: userDoc,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(
				"profileController -> updateProfile():",
				error.message,
			);
		}
		return res.status(500).json({
			message: "প্রোফাইল আপডেট প্রক্রিয়া ব্যর্থ হয়েছে।",
		});
	}
};

export const deleteUser: RequestHandler<
	{ id: string },
	{ message: string },
	{},
	{}
> = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not admin." });
	}

	const { id } = req.params;

	try {
		const deletedUser = await User.findByIdAndDelete(id);

		if (!deletedUser) {
			return res
				.status(404)
				.json({ message: "No such user found to delete!" });
		}

		res.status(200).json({ message: "User deleted successfully" });
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error in deleteUser:", error.message);
		}
		return res.status(500).json({
			message: "প্রোফাইল আপডেট প্রক্রিয়া ব্যর্থ হয়েছে।",
		});
	}
};
