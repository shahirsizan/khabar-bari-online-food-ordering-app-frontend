import { MenuItem } from "../model/MenuItem.js";

export const getAllMenuItems = async (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "You are not admin" });
	}

	try {
		const allMenuItems = await MenuItem.find().lean();
		// console.log(allMenuItems);

		res.status(200).json(allMenuItems);
	} catch (error) {
		console.error("Error fetching menu items:", error.message);
		res.status(500).json({
			message: error.message,
		});
	}
};

export const getMenuItem = async (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "You are not admin" });
	}

	const { id } = req.params;

	try {
		const menuItem = await MenuItem.findById(id).lean();
		// console.log(menuItem);

		res.status(200).json(menuItem);
	} catch (error) {
		console.error("Error fetching menu item:", error.message);
		res.status(500).json({
			message: error.message,
		});
	}
};

export async function addMenuItem(req, res) {
	const role = req.user.role;
	if (role !== "admin") {
		return res.status(403).json({ message: "Not authorized" });
	}

	const { name, description, image, basePrice } = req.body;

	try {
		const dataToInsert = {
			image: image,
			name: name,
			description: description,
			basePrice: basePrice,
		};
		const menuItemDoc = await MenuItem.create(dataToInsert);
		return res.status(200).json(menuItemDoc);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
}

export const updateMenuItem = async (req, res) => {
	if (req.user.role !== "admin") {
		return res.status(403).json({ message: "You are not admin" });
	}

	const { id } = req.params;
	const data = req.body;

	try {
		const updatedItem = await MenuItem.findByIdAndUpdate(id, data, {
			new: true,
		}).lean();

		if (!updatedItem) {
			return res.status(404).json({ message: "Menu item not found" });
		}

		res.status(200).json(updatedItem);
	} catch (error) {
		console.error("Error in updateMenuItem: ", error.message);
		res.status(500).json({
			message: "Server error, could not update item",
		});
	}
};

export const deleteMenuItem = async (req, res) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ message: "You are not an admin" });
	}

	const { id } = req.params;

	try {
		const deletedItem = await MenuItem.findByIdAndDelete(id);

		// Check if the item actually existed
		if (!deletedItem) {
			return res.status(404).json({ message: "Menu item not found" });
		}

		res.status(200).json({ message: "Menu item deleted successfully" });
	} catch (error) {
		console.error("Error in deleteMenuItem: ", error.message);
		res.status(500).json({
			message: error.message,
		});
	}
};
