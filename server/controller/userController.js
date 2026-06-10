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

export const updateUser = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not admin." });
	}

	const { id } = req.params;
	const updateData = req.body;

	try {
		const updatedUser = await User.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		console.error("Error in updateUser: ", error.message);
		res.status(500).json({ message: error.message });
	}
};
