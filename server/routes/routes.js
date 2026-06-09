import { Router } from "express";

import { middleware } from "../middleware/middleware.js";
import { paymentController } from "../controller/paymentController.js";
import { loginUser, registerUser } from "../controller/authController.js";
import { updateProfile } from "../controller/profileController.js";
import { isAuth } from "../middleware/authMiddleware.js";

import { upload } from "../middleware/upload.js";
import { uploadImage } from "../controller/uploadController.js";
import {
	addMenuItem,
	deleteMenuItem,
	getAllMenuItems,
	getMenuItem,
	updateMenuItem,
} from "../controller/menuItemsController.js";
import {
	getAllUsers,
	getUser,
	updateUser,
} from "../controller/userController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", isAuth, (req, res) => {
	res.json(req.user);
});
router.put("/profile", isAuth, updateProfile);
router.post("/upload", isAuth, upload.single("file"), uploadImage); // 'file' must match the field used in React FormData.set("file", ...)
router.post("/menu-items", isAuth, addMenuItem);
router.get("/menu-items", isAuth, getAllMenuItems);
router.get("/menu-items/:id", isAuth, getMenuItem);
router.put("/menu-items/:id", isAuth, updateMenuItem);
router.delete("/menu-items/:id", isAuth, deleteMenuItem);
router.get("/users", isAuth, getAllUsers);
router.get("/users/:id", isAuth, getUser);
router.put("/users/:id", isAuth, updateUser);

router.post(
	"/bkash/payment/create",
	middleware.bkash_auth,
	paymentController.payment_create,
);

router.get(
	"/bkash/payment/callback",
	middleware.bkash_auth,
	paymentController.call_back,
);

router.get(
	"/bkash/payment/:trxID",
	// middleware.bkash_auth,
	paymentController.getPaymentInfo,
);

router.get(
	"/bkash/payment/refund/:trxID",
	middleware.bkash_auth,
	paymentController.refund,
);

export default router;
