import { MenuItem } from "../model/MenuItem.js";
import redis from "../utils/redis.js";

export const getAllMenuItems = async (req, res) => {
	try {
		const CACHE_KEY = "menu_items:all";
		/***
		 * Check Redis cache first
		 */
		const cachedMenuItems = await redis.get(CACHE_KEY);
		if (cachedMenuItems) {
			return res.status(200).json(JSON.parse(cachedMenuItems));
		}

		/***
		 * Cache Miss: Fetch from MongoDB
		 */
		const allMenuItems = await MenuItem.find().lean();

		/***
		 * Store in Redis with TTL
		 */
		await redis.set(CACHE_KEY, JSON.stringify(allMenuItems), "EX", 3600);

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

	const CACHE_KEY = `menu_items:${id}`;
	/***
	 * Check Redis cache first
	 */
	const cachedMenuItem = await redis.get(CACHE_KEY);
	if (cachedMenuItem) {
		return res.status(200).json(JSON.parse(cachedMenuItem));
	}

	try {
		const menuItem = await MenuItem.findById(id).lean();
		await redis.set(CACHE_KEY, JSON.stringify(menuItem), "EX", 3600);

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

	const isEnglishNumeric = /^[0-9]+$/.test(basePrice);
	if (!isEnglishNumeric) {
		return res.status(500).json({ message: "ইংরেজিতে দাম উল্লেখ করুন।" });
	}

	try {
		const dataToInsert = {
			image: image,
			name: name,
			description: description,
			basePrice: basePrice,
		};
		const menuItemDoc = await MenuItem.create(dataToInsert);

		/***
		 * Invalidate stale cache
		 */
		await redis.del("menu_items:all");

		return res.status(200).json({
			message: "আইটেম সংযোজন প্রক্রিয়া সফল হয়েছে।",
			menuItemDoc: menuItemDoc,
		});
	} catch (error) {
		console.log("addMenuItem() error: ", error.message);

		return res
			.status(500)
			.json({ message: "আইটেম সংযোজন প্রক্রিয়া ব্যর্থ হয়েছে!" });
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

		/***
		 * Invalidate stale cache
		 */
		await redis.del("menu_items:all");

		res.status(200).json({
			message: "আইটেম এডিট প্রক্রিয়া সফল হয়েছে।",
			updatedItem,
		});
	} catch (error) {
		console.error("updateMenuItem() error: ", error.message);
		res.status(500).json({
			message: "আইটেম এডিট প্রক্রিয়া ব্যর্থ হয়েছে!",
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

		/***
		 * Invalidate stale cache
		 */
		await redis.del("menu_items:all");

		res.status(200).json({
			message: "আইটেম ডেলেট প্রক্রিয়া সফল হয়েছে।",
		});
	} catch (error) {
		console.error("deleteMenuItem() error: ", error.message);
		res.status(500).json({
			message: "আইটেম ডেলেট প্রক্রিয়া ব্যর্থ হয়েছে!",
		});
	}
};
