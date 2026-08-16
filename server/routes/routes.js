import { Router } from "express";
import { middleware } from "../middleware/middleware.js";
import { paymentController } from "../controller/paymentController.js";
import {
	forgotPassword,
	loginUser,
	registerUser,
	resetPasswordWithToken,
	updatePasswordWhenLoggedIn,
} from "../controller/authController.js";
import { isAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import { getPresignedSignature } from "../controller/uploadController.js";
import {
	addMenuItem,
	deleteMenuItem,
	getAllMenuItems,
	getMenuItem,
	updateMenuItem,
} from "../controller/menuItemsController.js";
import {
	deleteUser,
	getAllUsers,
	getUser,
	updateProfile,
} from "../controller/userController.js";
import {
	getOrder,
	getOrders,
	updateOrderStatus,
} from "../controller/orderController.js";
import {
	getNotifications,
	markNotificationAsRead,
} from "../controller/notificationController.js";
import {
	getChatRooms,
	getRoomMessages,
	getRoomName,
} from "../controller/chatController.js";
import { nanoid } from "nanoid";
import "dotenv/config";
import mongoose from "mongoose";
import { getIO } from "../utils/io.js";
import { Message } from "../model/Message.js";
import { User } from "../model/userModel.js";
import { Order } from "../model/orderModel.js";
import { Notification } from "../model/NotificationModel.js";
import SSLCommerzPayment from "sslcommerz-lts";
import { frontend_base_url } from "../workMode.js";
import {
	sslCommerzFail,
	sslCommerzPaymentStatusPolling,
	sslCommerzSuccess,
	sslPaymentInitialize,
	sslPaymentIPN,
} from "../controller/sslcommerzController.js";

const router = Router();

// Auth related routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password-with-token", resetPasswordWithToken);
router.put(
	"/update-password-when-logged-in",
	isAuth,
	updatePasswordWhenLoggedIn,
);

router.get("/me", isAuth, (req, res) => {
	res.json(req.user);
});

// Menu Item routes
router.get("/get-presigned-signature", isAuth, getPresignedSignature); // Direct Cloudinary image upload
router.post("/menu-items", isAuth, addMenuItem);
router.get("/menu-items", getAllMenuItems);
router.get("/menu-items/:id", isAuth, getMenuItem);
router.put("/menu-items/:id", isAuth, updateMenuItem);
router.delete("/menu-items/:id", isAuth, deleteMenuItem);

// User routes
router.get("/users", isAuth, getAllUsers);
router.get("/users/:id", isAuth, getUser);
router.put("/profile", isAuth, updateProfile);
router.delete("/users/:id", isAuth, deleteUser);

// Order routes
router.get("/orders", isAuth, getOrders);
router.get("/order/:id", isAuth, getOrder);
router.put("/order/:id", isAuth, updateOrderStatus);

// chat routes
router.get("/chat/rooms", isAuth, getChatRooms);
router.get("/chat/:roomId", isAuth, getRoomMessages);
router.get("/chatName/:roomId", isAuth, getRoomName);

// Notification routes
router.get("/notifications", isAuth, getNotifications);
router.put("/notifications/:id", isAuth, markNotificationAsRead);

// sslcommerz routes
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false;

/***
 * Triggered when user clicks "pay now" button.
	Gets redirected to sslcommerz gateway UI.
 */
router.post("/order", isAuth, sslPaymentInitialize);

/***
 * Sslcommerz calls this webhook endpoint.
 * Updating our database order status to `paid = true` is the main goal.
 * Why we need this?
 * Because malicious users can trigger success API call by themselves.
 * But they won't have our `store_id` and `store_passwd`. Only we have this.
 * Thus we let sslcommerz validate us by using our credentials in the background.
 */
router.post("/payment/ipn", sslPaymentIPN);

/***
 * Below URLs are set during router.post("/order",...) api call
 * 		success_url: `${process.env.IPN_URL}/api/payment/success/${tran_id}`,
		fail_url: `${process.env.IPN_URL}/api/payment/fail/${tran_id}`,
		cancel_url: `${process.env.IPN_URL}/api/payment/cancel/${tran_id}`,
		ipn_url: `${process.env.IPN_URL}/api/payment/ipn`,
 */

/***
 * Success Redirect Endpoint
 */
router.post("/payment/success/:tranId", sslCommerzSuccess);

/***
 * Failure Redirect Endpoint
 */
router.post("/payment/fail/:tranId", sslCommerzFail);

/***
 * Payment status polling endpoint
 */
router.get("/payment/status/:tranId", sslCommerzPaymentStatusPolling);

/***
 * BKASH ROUTES
 */
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
