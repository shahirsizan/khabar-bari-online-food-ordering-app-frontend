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
	getAllPublicMenuItems,
	getMenuItem,
	updateMenuItem,
} from "../controller/menuItemsController.js";
import {
	deleteUser,
	getAllUsers,
	getUser,
	updateUser,
} from "../controller/userController.js";
import { nanoid } from "nanoid";
import "dotenv/config";
import { Message } from "../model/Message.js";
import { User } from "../model/userModel.js";
import { Notification } from "../model/NotificationModel.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", isAuth, (req, res) => {
	res.json(req.user);
});
router.put("/profile", isAuth, updateProfile);
router.post("/upload", isAuth, upload.single("file"), uploadImage); // 'file' must match the field used in React FormData.set("file", ...)
router.post("/menu-items", isAuth, addMenuItem);
router.get("/public-menu-items", getAllPublicMenuItems);
router.get("/menu-items", isAuth, getAllMenuItems);
router.get("/menu-items/:id", isAuth, getMenuItem);
router.put("/menu-items/:id", isAuth, updateMenuItem);
router.delete("/menu-items/:id", isAuth, deleteMenuItem);
router.get("/users", isAuth, getAllUsers);
router.get("/users/:id", isAuth, getUser);
router.put("/users/:id", isAuth, updateUser);
router.delete("/users/:id", isAuth, deleteUser);
router.get("/orders", isAuth, getOrders);
router.get("/order/:id", isAuth, getOrder);
router.put("/order/:id", isAuth, updateOrderStatus);

// bkash routes
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

// sslcommerz routes
import SSLCommerzPayment from "sslcommerz-lts";
import { Order } from "../model/orderModel.js";
import {
	getOrder,
	getOrders,
	updateOrderStatus,
} from "../controller/orderController.js";
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false;

router.post("/order", isAuth, async (req, res) => {
	/***
	 * req.body is:
	 * 		{
				amount: cartTotal,
				orderId: 1,
				user,
				cartItems,
			};
	 */

	// nanoid() -> default size is 21.
	// const tran_id = nanoid(30);
	const tran_id = nanoid();
	const data = {
		total_amount: req.body.amount,
		currency: "BDT",
		tran_id: tran_id,
		product_name: "Consumer Product",
		product_category: "Consumer Product",
		product_profile: "general",
		cus_name: req.body.user.name,
		cus_email: req.body.user.email,
		cus_phone: req.body.user.phone,
		cus_add1: req.body.user.streetAddress,
		cus_city: req.body.user.city,
		cus_postcode: "1000",
		cus_country: "Bangladesh",
		shipping_method: "NO",
		success_url: `${process.env.IPN_URL}/api/payment/success/${tran_id}`,
		fail_url: `${process.env.IPN_URL}/api/payment/fail/${tran_id}`,
		cancel_url: `${process.env.IPN_URL}/api/payment/cancel/${tran_id}`,
		ipn_url: `${process.env.IPN_URL}/api/payment/ipn`,
		multi_card_name: "bkash",
	};
	//
	/***
	 * run `ngrok http 5000` in terminal to generate neu ngrom url
	 * change the `IPN_URL` env shit everytime the machine restarts. Because ngrok changes the url everytime.
	 */

	try {
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		const apiResponse = await sslcz.init(data);
		// console.log("apiResponse: ", apiResponse);

		if (apiResponse) {
			let GatewayPageURL = apiResponse.GatewayPageURL;

			const finalOrder = {
				totalAmount: req.body.amount,
				userId: req.body.user._id,
				userName: req.body.user.name,
				userEmail: req.body.user.email,
				phone: req.body.user.phone,
				streetAddress: req.body.user.streetAddress,
				city: req.body.user.city,
				cartProducts: req.body.cartItems,
				tran_id: tran_id,
				paid: false,
			};

			const result = await Order.insertOne(finalOrder);
			/***
			 * the insertOne() method ⬆️ resolves to an object with the following properties:
			 * result :
			 * {
					acknowledged: true,
					insertedId: new ObjectId('65a12345f1234567890abcde')
				}
			 */

			// Create a notification for Admin
			// Fetch admin record from User collection
			const adminUser = await User.findOne({ role: "admin" });
			const adminId = adminUser ? adminUser._id : null;

			if (adminId) {
				const adminNotification = await Notification.create({
					recipientId: adminId,
					message: `New order placed by ${req.body.user.name}`,
					type: "order",
					link: `/order/${result.insertedId}`,
					metadata: {
						orderId: result.insertedId,
						status: "Pending",
					},
				});

				// Realtime notofication dispatched into admin room
				const io = getIO();
				io.to("admin_room").emit("order_placed", adminNotification);
			}

			res.status(200).json({ redirectUrl: GatewayPageURL });
			return;
		}
	} catch (error) {
		console.log("Error: ", error.message);
	}
});

router.post("/payment/ipn", async (req, res) => {
	try {
		console.log("/payment/ipn called");
		console.log("req.body: ", req.body);

		const { val_id } = req.body;
		const data = {
			val_id,
			store_id: store_id,
			store_passwd: store_passwd,
		};
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		const response = await sslcz.validate(data);
		if (response) {
			/***
			 * response:  {
					status: 'VALID',
					tran_date: '2026-06-14 15:18:29',
					tran_id: 'wZr9Dxy4oiaIvq2fZ7oKxIbcUkxlFA',
					val_id: '260614151839MOgiSqKwPnQ4kR2',
					amount: '300.00',
					store_amount: '292.5',
					currency: 'BDT',
					bank_tran_id: '260614151839soRgpuAh1WSYBkr',
					card_type: 'BKASH-BKash',
					card_no: '',
					card_issuer: 'BKash Mobile Banking',
					card_brand: 'MOBILEBANKING',
					card_category: 'MOBILE',
					card_sub_brand: '',
					card_issuer_country: 'Bangladesh',
					card_issuer_country_code: 'BD',
					currency_type: 'BDT',
					currency_amount: '300.00',
					currency_rate: '1.0000',
					base_fair: '0.00',
					value_a: '',
					value_b: '',
					value_c: '',
					value_d: '',
					emi_instalment: '0',
					emi_amount: '0.00',
					emi_description: '',
					emi_issuer: 'BKash Mobile Banking',
					account_details: '',
					risk_title: 'Safe',
					risk_level: '0',
					discount_percentage: '0',
					discount_amount: '0.00',
					discount_remarks: '',
					APIConnect: 'DONE',
					validated_on: '2026-06-14 15:18:39',
					gw_version: '',
					offer_avail: 1,
					card_ref_id: 'dc1da4f52669828139e81ef5eb0f48a5a99ea054a131e00a562887d455417dd915',
					isTokeizeSuccess: 0,
					campaign_code: ''
					}
			 */
			console.log("response: ", response);

			const { status, tran_id, val_id, amount } = response;

			if (status === "VALID" || status === "VALIDATED") {
				await Order.updateOne(
					{ tran_id: tran_id },
					{ $set: { paid: true } },
				);
			}
			//⚠️ In case of `failed`/`cancelled` transactions, no `tran_id` or `val_id` will be there in the `response`
			// object returned from the `sslcz.validate()` call above.
			// So have to get the `tran_id` from the req.body instead.
			else {
				await Order.deleteOne({ tran_id: req.body.tran_id });
			}
		}
	} catch (error) {
		console.error(error.message);
	}
});

router.post("/payment/success/:tranId", async (req, res) => {
	try {
		console.log("/payment/success/:tranId called");
		return res.redirect(
			`http://localhost:5173/success?tranId=${req.params.tranId}`,
		);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server error" });
	}
});

router.post("/payment/fail/:tranId", async (req, res) => {
	try {
		console.log("/payment/fail/:tranId called");
		return res.redirect(
			`http://localhost:5173/error?tranId=${req.params.tranId}&message=failed`,
		);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({ message: "Server error" });
	}
});

router.get("/payment/status/:tranId", async (req, res) => {
	try {
		const { tranId } = req.params;

		const order = await Order.findOne({ tran_id: tranId });

		if (!order) {
			return res.status(404).json({ message: "Order not found!" });
		}

		res.status(200).json({
			paid: order.paid,
			orderDetail: order.paid ? order : null,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// chat routes
router.get("/chat/rooms", async (req, res) => {
	try {
		/***
		 * This aggregation pipeline is responsible to show the chat heads of the sidebar.
		 * Stage 1: 
		 * 		{ $sort: { createdAt: -1 } }
				Sorts every message document by their creation time. It puts the newest messages at the beginning of the stream.
			 
		   Stage 2: 
				$group: {
					_id: "$roomId",
					latestMessage: { $first: "$text" },
					lastUpdatedAt: { $first: "$createdAt" },
					lastSenderRole: { $first: "$senderRole" }
				}
			
				_id: "$roomId": Collapses the sorted stream into buckets based on the chat room.
				$first Accumulator: Extracts data from the absolute first document it encounters in each bucket.
				The Logic: Because Stage 1 sorted everything newest-first, the "first" document in each room bucket is guaranteed to be 
				that room's latest message.
				Output: This stage reduces your massive list of messages down to a single document per unique room.
			
			Stage 3: 
				$sort (Final Presentation Sorting)
			
				Re-sorts the newly created room summary documents.
				Why it matters: It ensures the chat rooms with the absolute freshest activity appear first.
				Real-world use: This mimics the inbox behavior of apps like WhatsApp or Slack, where active chats jump to the top of your screen.
		 */
		const recentChats = await Message.aggregate([
			// 1. Sort all messages by newest first
			{ $sort: { createdAt: -1 } },

			// 2. Group by roomId, keeping only the first (newest) message data
			{
				$group: {
					_id: "$roomId", // The group key becomes the roomId
					roomName: { $first: "$roomName" }, // Capture the room name from the first message in the group
					latestMessage: { $first: "$text" },
					lastUpdatedAt: { $first: "$createdAt" },
					lastSenderRole: { $first: "$senderRole" },
				},
			},

			// 3. Sort the resulting groups by whoever messaged most recently
			{ $sort: { lastUpdatedAt: -1 } },
		]);

		res.status(200).json(recentChats);
	} catch (error) {
		console.error("Error fetching chat rooms: ", error.message);
		res.status(500).json({ error: error.message });
	}
});

router.get("/chat/:roomId", async (req, res) => {
	try {
		const messages = await Message.find({ roomId: req.params.roomId }).sort(
			{ createdAt: 1 },
		);
		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Notification routes
router.get("/notifications", isAuth, getNotifications);
router.put("/notifications/:id", isAuth, markNotificationAsRead);

export default router;
