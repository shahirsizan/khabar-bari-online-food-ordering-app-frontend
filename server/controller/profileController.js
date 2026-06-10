import { User } from "../model/userModel.js";

export const updateProfile = async (req, res) => {
	try {
		// console.log(req.body);

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
			{ email: email },
			{
				name: userName,
				phone: phone,
				streetAddress: streetAddress,
				city: city,
				role: role,
			},
			{ new: true }, // Returns the modified document
		).lean();

		if (!userDoc) {
			return res.status(404).json({ message: "User not found" });
		}

		delete userDoc.password;

		return res.status(200).json({
			message: "Profile updated successfully",
			user: userDoc,
		});
	} catch (error) {
		console.error("profileController -> updateProfile():", error.message);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};
