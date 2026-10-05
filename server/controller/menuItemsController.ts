import { RequestHandler } from "express";
import { IMenuItem, MenuItem } from "../model/MenuItem.js";
import { redisConnection } from "../utils/redis.js";

export const getAllMenuItems: RequestHandler<
	{},
	IMenuItem[] | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		const CACHE_KEY = "menu_items:all";
		/***
		 * Check Redis cache first
		 */
		if (redisConnection) {
			const cachedMenuItems = (await redisConnection.get(CACHE_KEY)) as
				| string
				| null;

			if (typeof cachedMenuItems === "string") {
				const response = JSON.parse(cachedMenuItems) as IMenuItem[];
				return res.status(200).json(response);
			}
		}

		/***
		 * Cache Miss: Fetch from MongoDB
		 */
		const allMenuItems = (await MenuItem.find().lean()) as IMenuItem[] | [];

		/***
		 * Store in Redis with TTL
		 */
		if (redisConnection) {
			await redisConnection.set(
				CACHE_KEY,
				JSON.stringify(allMenuItems),
				"EX",
				3600,
			);
		}

		return res.status(200).json(allMenuItems);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error fetching menu items:", error.message);
			return res.status(500).json({
				message: error.message,
			});
		} else {
			return res.status(500).json({
				message: "getAllMenuItems() error.",
			});
		}
	}
};

export const getMenuItem: RequestHandler<
	{ id: string },
	IMenuItem | { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		if (!req.user || req.user.role !== "admin") {
			return res.status(403).json({ message: "You are not admin" });
		}

		const { id } = req.params;

		const CACHE_KEY = `menu_items:${id}`;
		/***
		 * Check Redis cache first
		 */
		if (redisConnection) {
			const cachedMenuItem = (await redisConnection.get(CACHE_KEY)) as
				| string
				| null;

			if (typeof cachedMenuItem === "string") {
				const response = JSON.parse(cachedMenuItem) as IMenuItem;
				return res.status(200).json(response);
			}
		}

		const menuItem = (await MenuItem.findById(
			id,
		).lean()) as IMenuItem | null;

		if (!menuItem) {
			return res.status(404).json({ message: "Menu item not found" });
		}

		if (redisConnection) {
			await redisConnection.set(
				CACHE_KEY,
				JSON.stringify(menuItem),
				"EX",
				3600,
			);
		}

		return res.status(200).json(menuItem);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error fetching menu item:", error.message);
			return res.status(500).json({
				message: error.message,
			});
		} else {
			return res.status(500).json({
				message: "getMenuItem() error.",
			});
		}
	}
};

export const addMenuItem: RequestHandler<
	{},
	{ message: string; menuItemDoc: IMenuItem } | { message: string },
	{ name: string; description: string; image: string; basePrice: string },
	{}
> = async (req, res) => {
	if (!req.user || req.user.role !== "admin") {
		return res.status(403).json({ message: "Not authorized" });
	}

	const { name, description, image, basePrice } = req.body;

	const isEnglishNumeric = /^[0-9]+$/.test(basePrice);
	if (!isEnglishNumeric) {
		return res.status(500).json({ message: "ইংরেজিতে দাম উল্লেখ করুন।" });
	}

	try {
		const dataToInsert: Partial<IMenuItem> = {
			image: image,
			name: name,
			description: description,
			basePrice: parseInt(basePrice, 10),
		};

		const createdDoc = await MenuItem.create(dataToInsert);
		const menuItemDoc = createdDoc.toObject() as IMenuItem;

		/***
		 * Invalidate stale cache
		 */
		if (redisConnection) {
			await redisConnection.del("menu_items:all");
		}

		return res.status(200).json({
			message: "আইটেম সংযোজন প্রক্রিয়া সফল হয়েছে।",
			menuItemDoc: menuItemDoc,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("addMenuItem() error: ", error.message);
			return res
				.status(500)
				.json({ message: "আইটেম সংযোজন প্রক্রিয়া ব্যর্থ হয়েছে!" });
		} else {
			return res
				.status(500)
				.json({ message: "আইটেম সংযোজন প্রক্রিয়া ব্যর্থ হয়েছে!" });
		}
	}
};

export const updateMenuItem: RequestHandler<
	{ id: string },
	{ message: string; updatedItem: IMenuItem } | { message: string },
	Omit<IMenuItem, "_id" | "createdAt" | "updatedAt">,
	{}
> = async (req, res) => {
	try {
		if (!req.user || req.user.role !== "admin") {
			return res.status(403).json({ message: "You are not admin" });
		}

		const { id } = req.params;
		const { name, description, image, basePrice } = req.body;

		const updatedItem = (await MenuItem.findByIdAndUpdate(
			id,
			{
				name: name,
				description: description,
				image: image,
				basePrice: basePrice,
			},
			{
				new: true,
			},
		).lean()) as IMenuItem | null;

		if (!updatedItem) {
			return res.status(404).json({ message: "Menu item not found" });
		}

		/***
		 * Invalidate stale cache
		 */
		if (redisConnection) {
			await redisConnection.del("menu_items:all");
			await redisConnection.del(`menu_items:${id}`);
		}

		return res.status(200).json({
			message: "আইটেম এডিট প্রক্রিয়া সফল হয়েছে।",
			updatedItem: updatedItem,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("updateMenuItem() error: ", error.message);
		}
		return res.status(500).json({
			message: "আইটেম এডিট প্রক্রিয়া ব্যর্থ হয়েছে!",
		});
	}
};

export const deleteMenuItem: RequestHandler<
	{ id: string },
	{ message: string },
	{},
	{}
> = async (req, res) => {
	if (!req.user || req.user.role !== "admin") {
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
		if (redisConnection) {
			await redisConnection.del("menu_items:all");
			await redisConnection.del(`menu_items:${id}`);
		}

		return res.status(200).json({
			message: "আইটেম ডেলেট প্রক্রিয়া সফল হয়েছে।",
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("deleteMenuItem() error: ", error.message);
		}
		return res.status(500).json({
			message: "আইটেম ডেলেট প্রক্রিয়া ব্যর্থ হয়েছে!",
		});
	}
};
