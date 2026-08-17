import { User } from "../model/userModel.js";

export const getAllUsers = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not admin." });
	}

	try {
		const users = await User.find().select("-password").lean();

		res.status(200).json(users);
	} catch (error) {
		console.error("Error in getAllUsers:", error.message);
		res.status(500).json({
			message: error.message,
		});
	}
};

export const getUser = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not admin." });
	}

	const { id } = req.params;

	try {
		const user = await User.findById(id).select("-password").lean();

		res.status(200).json(user);
	} catch (error) {
		console.error("Error in getUser:", error.message);
		res.status(500).json({
			message: error.message,
		});
	}
};

export const updateProfile = async (req, res) => {
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
		const userDoc = await User.findOneAndUpdate(
			{ email: req.user.role === "admin" ? email : req.user.email },
			{
				name: userName,
				phone: phone,
				streetAddress: streetAddress,
				city: city,
				role: req.user.role === "admin" ? role : req.user.role,
			},
			{ new: true }, // Returns the modified document
		).lean();

		if (!userDoc) {
			return res.status(404).json({ message: "User not found" });
		}

		delete userDoc.password;

		return res.status(200).json({
			message: "প্রোফাইল আপডেট প্রক্রিয়া সফল হয়েছে।",
			user: userDoc,
		});
	} catch (error) {
		console.error("profileController -> updateProfile():", error.message);
		return res.status(500).json({
			message: "প্রোফাইল আপডেট প্রক্রিয়া ব্যর্থ হয়েছে।",
		});
	}
};

export const deleteUser = async (req, res) => {
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
	} catch (error) {
		console.error("Error in deleteUser:", error.message);
		res.status(500).json({
			message: error.message,
		});
	}
};
