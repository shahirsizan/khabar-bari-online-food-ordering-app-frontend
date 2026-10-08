import { RequestHandler } from "express";
import { nanoid } from "nanoid";
import "dotenv/config";
import mongoose from "mongoose";
import { getIO } from "../utils/io.js";
import SSLCommerzPayment from "sslcommerz-lts";
import { ICartProduct, IOrder, Order } from "../model/orderModel.js";
import { IUser, User } from "../model/userModel.js";
import { Notification } from "../model/NotificationModel.js";
import sendEmail from "../utils/sendEmail.js";
import { backend_base_url, frontend_base_url, mode } from "../workMode.js";
import { auditQueue } from "../utils/auditQueue.js";

interface IPopulatedUser {
	_id: mongoose.Types.ObjectId;
	name: string;
	email: string;
	role: string;
}

interface InitPaymentRequestBody {
	amount: number;
	user: Omit<Partial<IUser>, "password">;
	cartItems: ICartProduct[];
}

interface IPNRequestBody {
	tran_id?: string;
	val_id?: string;
	amount?: string;
	status?: string;
	[key: string]: any;
}

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false;

/***
 * Triggered when user clicks "pay now" button.
 * Gets redirected to sslcommerz gateway screen.
 */
export const sslPaymentInitialize: RequestHandler<
	{},
	{ redirectUrl: string } | { message: string },
	InitPaymentRequestBody,
	{}
> = async (req, res) => {
	try {
		if (!store_id || !store_passwd) {
			console.error("Missing sslcommerz store_id and store_passwd.");
			return res.status(500).json({
				message: "sslcommerz setup configs are currently unavailable.",
			});
		}

		const { amount, user, cartItems } = req.body;

		if (
			!amount ||
			!user ||
			!user._id ||
			!cartItems ||
			cartItems.length === 0
		) {
			return res.status(400).json({
				message: "Order details or user profile inputs are missing.",
			});
		}

		/*** Interface detail
	 interface InitPaymentRequestBody {
		amount: number;
		user: {
			_id: string;
			name: string;
			email: string;
			phone: string;
			streetAddress: string;
			city: string;
		};
		cartItems: {
			id: string;
			name: string;
			price: number;
			desc: string;
			image: string;
			quantity: number;
		}[];
	}
	 */

		// nanoid() -> default size is 21.
		// const tran_id = nanoid(30);
		const tran_id = nanoid();
		const data = {
			total_amount: amount,
			currency: "BDT",
			tran_id: tran_id,
			product_name: "Consumer Product",
			product_category: "Consumer Product",
			product_profile: "general",
			cus_name: user.name,
			cus_email: user.email?.toLowerCase().trim(),
			cus_phone: user.phone,
			cus_add1: user.streetAddress,
			cus_city: user.city,
			cus_postcode: "1000",
			cus_country: "Bangladesh",
			shipping_method: "NO",
			success_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/success/${tran_id}`,
			fail_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/fail/${tran_id}`,
			cancel_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/cancel/${tran_id}`,
			ipn_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/ipn`,
			multi_card_name: "bkash",
		};

		/***
		 * run `ngrok http 5000` in terminal while in `dev` mode.
		 * Because SSLCommerz requires a public URL to send IPN (Instant Payment Notification) callbacks.
		 */

		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		const apiResponse = await sslcz.init(data);
		// console.log("apiResponse: ", apiResponse);

		if (apiResponse) {
			let GatewayPageURL = apiResponse.GatewayPageURL;

			const finalOrder: Partial<IOrder> = {
				totalAmount: `${amount}`,
				userId: user._id,
				userName: user.name,
				userEmail: user.email?.toLowerCase().trim(),
				phone: user.phone,
				streetAddress: user.streetAddress,
				city: user.city,
				cartProducts: cartItems,
				tran_id: tran_id,
				paid: false,
			};

			const result = await Order.create(finalOrder);
			console.log(`router.post("/order",...) -> result: `, result);

			res.status(200).json({ redirectUrl: GatewayPageURL });
			return;
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("sslPaymentInitialize() error ", error.message);
		}
		console.log("sslPaymentInitialize() error: ", error);
		return res.status(500).json({
			message: "একটি সমস্যা হয়েছে। পুনরায় চেষ্টা করুন!",
		});
	}
};

/***
 * Sslcommerz calls this webhook endpoint.
 * Updating our database order status to `paid = true` is the main goal.
 * Why we need this?
 * Because malicious users can trigger success API call by themselves.
 * But they won't have our `store_id` and `store_passwd`. Only we have this.
 * Thus we let sslcommerz validate us by using our credentials in the background.
 */
export const sslPaymentIPN: RequestHandler<
	{},
	string,
	IPNRequestBody,
	{}
> = async (req, res) => {
	try {
		console.log("/payment/ipn called by sslcommerz");

		/***
         * console.log("req.body: ", req.body);
         * req.body:  {
                👉 amount: '220.00',
                bank_tran_id: '260813224353cWmrBTAoQ30oRgp',
                base_fair: '0.00',
                card_brand: 'MOBILEBANKING',
                👉 card_issuer: 'BKash Mobile Banking',
                card_issuer_country: 'Bangladesh',
                card_issuer_country_code: 'BD',
                card_no: '',
                card_sub_brand: 'Classic',
                card_type: 'BKASH-BKash',
                currency: 'BDT',
                currency_amount: '220.00',
                currency_rate: '1.0000',
                currency_type: 'BDT',
                error: '',
                risk_level: '0',
                risk_title: 'Safe',
                status: 'VALID',
                store_amount: '214.50',
                store_id: 'shahi6a2b98c5d0da6',
                👉 tran_date: '2026-08-13 22:43:43',
                👉 tran_id: 'j0Pz_hU77K-3PHG9KW0GN',
                👉 val_id: '260813224353QQCg3EiAU7gduKD',
                value_a: '',
                value_b: '',
                value_c: '',
                value_d: '',
                verify_sign: 'b9df0881d503ba4836824b4659ce1add',
                verify_sign_sha2: '961dfff254bf73ba436e6b2e3efcc9bcc5054a1fa35154a294189baebdc75cf4',
                verify_key: 'amount,bank_tran_id,base_fair,card_brand,card_issuer,card_issuer_country,card_issuer_country_code,card_no,card_sub_brand,card_type,currency,currency_amount,currency_rate,currency_type,error,risk_level,risk_title,status,store_amount,store_id,tran_date,tran_id,val_id,value_a,value_b,value_c,value_d'
                }
         */

		const { tran_id, val_id } = req.body;

		if (!tran_id || !val_id) {
			console.error(`IPN Error: tran_id / val_id missing`);
			return res.status(200).send("tran_id / val_id missing");
		}

		/***
		 * Idempotency guard: Skip if already processed and already paid
		 * 1. Fetch order from DB first
		 * 2. If order.paid === true, it immediately returns HTTP 200 to prevent duplicate database
		 * writes or duplicate notifications.
		 */
		const orderObj = await Order.findOne({
			tran_id: tran_id,
			paid: false,
		}).lean();

		if (!orderObj) {
			console.error(`IPN Error: No order found for tran_id: ${tran_id}`);
			return res.status(200).send("Order not found");
		}

		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		const response: {
			status: "VALID" | "VALIDATED" | "INVALID_TRANSACTION";
			tran_id: string;
			val_id: string;
			amount: string;
		} = await sslcz.validate({
			val_id,
			store_id: store_id,
			store_passwd: store_passwd,
		});

		if (
			response &&
			(response.status === "VALID" || response.status === "VALIDATED")
		) {
			/***
             *  console.log(
                    `router.post("/payment/ipn",...) -> response: `,
                    response,
                );
             * response:  {
                    👉status: 'VALID',
                    tran_date: '2026-06-14 15:18:29',
                    👉tran_id: 'wZr9Dxy4oiaIvq2fZ7oKxIbcUkxlFA',
                    👉val_id: '260614151839MOgiSqKwPnQ4kR2',
                    👉amount: '300.00',
                    👉store_amount: '292.5',
                    currency: 'BDT',
                    bank_tran_id: '260614151839soRgpuAh1WSYBkr',
                    card_type: 'BKASH-BKash',
                    card_no: '',
                    👉card_issuer: 'BKash Mobile Banking',
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

			const { status, tran_id, val_id, amount } = response;

			/***
			 * Check if `paid amount` matches expected amount. 
				If not, we mark the order as `paid: false` and return early.
			 */
			const paidAmount = parseFloat(amount);
			const expectedAmount = parseFloat(orderObj.totalAmount);
			if (paidAmount.toFixed(2) !== expectedAmount.toFixed(2)) {
				console.error(`paidAmount and expectedAmount don't match`);
				return res.status(200).send("Amount mismatch detected");
			}

			/***
			 * All validation completed.
			 * Update DB entry as `paid: true`
			 * and get the updated document with user info embedded
			 */
			const orderObjWithUser = await Order.findOneAndUpdate(
				{ tran_id: tran_id, paid: false },
				{ $set: { paid: true } },
				{ new: true },
				/***
				 * Returns the modified document instead of the original
				 */
			).populate<{ userId: IPopulatedUser }>("userId", "name email role");
			/***
			 * By default, TS only expects a simple ID string. When we use .populate(), Mongoose changes
			 * that ID into a full sub-object at runtime. TS does not know this happened, so it will throw
			 * errors if we try to read properties inside it.
			 * The solution: We pass the populated object type directly inside the populate() method
			 */

			if (!orderObjWithUser) {
				return res
					.status(200)
					.send(
						"Order execution race condition blocked successfully.",
					);
			}

			/***
				 * orderObjWithUser:
				 * {
					"_id": "65a1234b56c7890123def456",
					"tran_id": "TXN_987654321",
					"totalAmount": 149.99,
					"status": "paid",
					"userId": {
						"_id": "65b9876f54e3210987abc654",
						"name": "John Doe",
						"email": "johndoe@gmail.com"
					},
					"createdAt": "2026-03-31T10:00:00.000Z",
					"updatedAt": "2026-03-31T10:05:00.000Z",
					"__v": 0
					}
				 */

			/***
			 * Time to audit log the successful payment. But because our existing logging middleware
			 * doesn't have access to the `req` and `res` objects during this server-server webhook context,
			 * we will manually enqueue new log entry to bullmq through Redis for async processing.
			 */
			await auditQueue.add("new-audit-log", {
				userId: orderObjWithUser.userId?._id,
				userEmail: orderObjWithUser.userId?.email,
				action: "PLACE_ORDER",
				targetEntityType: "Order",
				details: {
					method: "POST",
					url: "/api/payment/ipn",
					reqBody: req.body,
					resBody: response,
				},
				// Below fields are `default` from mongoose schema
				// ipAddress:,
				// userAgent:,
			});

			/***
			 * Notify admin for a new order.
			 */
			const adminUser = await User.findOne({ role: "admin" }).lean();
			if (adminUser) {
				const adminNotification = await Notification.create({
					recipientId: new mongoose.Types.ObjectId(adminUser._id),
					message: `New order by ${orderObjWithUser.userName}`,
					type: "order",
					link: `/order/${orderObjWithUser._id.toString()}`,
					metadata: {
						orderId: orderObj._id,
						status: "Pending",
					},
				});

				// Dispatch notification
				const io = getIO();
				io.to("admin_room").emit("new_order_placed", adminNotification);
			}

			// Success response to SSLCommerz
			return res.status(200).send("IPN Processed Successfully");
		} else {
			/***
			 * In case of failed validation, Instead of deleting, we keep the record for
			 * audit purpose with payment status "false" as it is already marked as "false"
			 */
			return res.status(200).send("Payment validation failed");
		}
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("sslPaymentIPN() error ", error.message);
		}
		console.log("sslPaymentIPN() error: ", error);
		return res.status(500).json("Problem while processing sslPaymentIPN");
	}
};

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
export const sslCommerzSuccess: RequestHandler<
	{ tranId: string },
	{},
	{},
	{}
> = async (req, res) => {
	try {
		const { tranId } = req.params;
		console.log("/payment/success/:tranId called");
		return res.redirect(
			303,
			`${frontend_base_url}/success?tranId=${tranId}`,
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("sslCommerzSuccess() error ", error.message);
		}
		console.log("sslCommerzSuccess() error: ", error);
		return res
			.status(500)
			.json({ message: "Problem while processing sslCommerzSuccess()" });
	}
};

/***
 * Failure Redirect Endpoint
 */
export const sslCommerzFail: RequestHandler<
	{ tranId: string },
	{},
	{},
	{}
> = async (req, res) => {
	try {
		console.log("/payment/fail/:tranId called");
		const { tranId } = req.params;
		return res.redirect(
			303,
			`${frontend_base_url}/error?tranId=${tranId}&message=failed`,
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("sslCommerzFail() error ", error.message);
		}
		console.log("sslCommerzFail() error: ", error);
		return res
			.status(500)
			.json("Problem while processing sslCommerzFail()");
	}
};

/***
 * Payment status polling endpoint
 */

export const sslCommerzPaymentStatusPolling: RequestHandler<
	{ tranId: string },
	| { message: string; paid: boolean; orderDetail: any | null }
	| { message: string },
	{},
	{}
> = async (req, res) => {
	try {
		const { tranId } = req.params;

		if (!tranId) {
			return res.status(400).json({
				message: "TrxId is unavailable.",
			});
		}

		const order = await Order.findOne({
			tran_id: tranId,
		})
			.populate<{ userId: Omit<IUser, "password"> }>(
				"userId",
				"-password",
			)
			.lean();

		if (!order) {
			return res
				.status(404)
				.json({ message: `Order ${tranId} not found!` });
		}

		res.status(200).json({
			message: "Order placed successfully!",
			paid: order.paid,
			orderDetail: order.paid ? order : null,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("/payment/status/:tranId Error: ", error.message);
		}
		console.log("/payment/status/:tranId Error: ", error);
		return res
			.status(500)
			.json({ message: "/payment/status/:tranId Error: " });
	}
};
