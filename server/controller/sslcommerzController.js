import { nanoid } from "nanoid";
import "dotenv/config";
import mongoose from "mongoose";
import { getIO } from "../utils/io.js";
import SSLCommerzPayment from "sslcommerz-lts";
import { Order } from "../model/orderModel.js";
import { User } from "../model/userModel.js";
import { Notification } from "../model/NotificationModel.js";
import sendEmail from "../utils/sendEmail.js";
import { backend_base_url, frontend_base_url, mode } from "../workMode.js";

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false;

/***
 * Triggered when user clicks "pay now" button.
	Gets redirected to sslcommerz gateway UI.
 */
export const sslPaymentInitialize = async (req, res) => {
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
		success_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/success/${tran_id}`,
		fail_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/fail/${tran_id}`,
		cancel_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/cancel/${tran_id}`,
		ipn_url: `${mode === "dev" ? process.env.IPN_URL : backend_base_url}/api/payment/ipn`,
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
			console.log(`router.post("/order",...) -> result: `, result);

			/***
			 * the insertOne() method ⬆️ resolves to an object with the following properties:
			 * result :
			 * {
					acknowledged: true,
					insertedId: new ObjectId('65a12345f1234567890abcde')
				}
			 */

			res.status(200).json({ redirectUrl: GatewayPageURL });
			return;
		}
	} catch (error) {
		console.log("Error: ", error.message);
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
export const sslPaymentIPN = async (req, res) => {
	try {
		console.log("/payment/ipn called by sslcommerz");

		/***
         * console.log("req.body: ", req.body);
         * req.body:  {
                amount: '220.00',
                bank_tran_id: '260813224353cWmrBTAoQ30oRgp',
                base_fair: '0.00',
                card_brand: 'MOBILEBANKING',
                card_issuer: 'BKash Mobile Banking',
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
                tran_date: '2026-08-13 22:43:43',
                tran_id: 'j0Pz_hU77K-3PHG9KW0GN',
                val_id: '260813224353QQCg3EiAU7gduKD',
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
			console.error(`tran_id / val_id missing`);
			return res.status(200).send("tran_id / val_id missing");
		}

		/***
		 * Null record guard
		 */
		const orderObj = await Order.findOne({
			tran_id: tran_id,
		}).lean();
		if (!orderObj) {
			console.error(`IPN Error: No order found for tran_id: ${tran_id}`);
			return res.status().send("Order not found");
		}

		/***
		 * Idempotency guard: Skip if already processed
		 * 1. Fetch order from DB first
		 * 2. If order.paid === true, it immediately returns HTTP 200 to prevent duplicate database
		 * writes or duplicate notifications.
		 */
		if (orderObj.paid) {
			console.log(`IPN Info: Order ${tran_id} already processed.`);
			return res.status(200).send("Order already processed");
		}

		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		const response = await sslcz.validate({
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

			const { status, tran_id, val_id, amount } = response;

			// Check if `paid amount` matches expected amount
			const paidAmount = parseFloat(response.amount);
			const expectedAmount = parseFloat(orderObj.totalAmount);
			if (paidAmount !== expectedAmount) {
				console.error(`paidAmount and expectedAmount don't match`);
				await Order.updateOne(
					{ tran_id: tran_id },
					{ $set: { paid: false } },
				);
				return res.status(200).send("Amount mismatch detected");
			}

			// If validated, update the DB entry as `paid: true`
			await Order.updateOne(
				{ tran_id: tran_id },
				{ $set: { paid: true } },
			);

			/***
			 * ℹ️ℹ️ℹ️ Send receipt pdf to user through email. Kalke dekhte hobe
			 */
			// await sendEmail({
			// 	email: orderObj.userEmail,
			// 	subject: "Order Confirmed",
			// 	message: message,
			// });

			// Now notify admin for a new order.
			const adminUser = await User.findOne({ role: "admin" });
			if (adminUser) {
				const adminId = adminUser._id;
				const customerName = orderObj.userName;

				const adminNotification = await Notification.create({
					recipientId: new mongoose.Types.ObjectId(adminId),
					message: `New order by ${customerName}`,
					type: "order",
					link: `/order/${orderObj._id.toString()}`,
					metadata: {
						orderId: orderObj._id,
						status: "Pending",
					},
				});

				// Dispatch notification
				const io = getIO();
				io.to("admin_room").emit("new_order_placed", adminNotification);

				// Success response to SSLCommerz
				return res.status(200).send("IPN Processed Successfully");
			}
		} else {
			/***
             * Handle failed validation cleanly. Instead of deleting,
               we keep the record for audit purpose with payment status "false" (failed)
             */
			await Order.updateOne(
				{ tran_id: tran_id },
				{ $set: { paid: false } },
			);
			return res.status(200).send("Payment validation failed");
		}
	} catch (error) {
		console.error("IPN Exception: ", error.message);
		// Ensure connection closes
		return res.status(500).send("Internal Server Error");
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
export const sslCommerzSuccess = async (req, res) => {
	try {
		console.log("/payment/success/:tranId called");
		return res.redirect(
			303,
			`${frontend_base_url}/success?tranId=${req.params.tranId}`,
		);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({
			message: "Server error during success redirect",
		});
	}
};

/***
 * Failure Redirect Endpoint
 */
export const sslCommerzFail = async (req, res) => {
	try {
		console.log("/payment/fail/:tranId called");
		return res.redirect(
			303,
			`${frontend_base_url}/error?tranId=${req.params.tranId}&message=failed`,
		);
	} catch (error) {
		console.error(error.message);
		res.status(500).json({
			message: "Server error during failure redirect",
		});
	}
};

/***
 * Payment status polling endpoint
 */

export const sslCommerzPaymentStatusPolling = async (req, res) => {
	try {
		const { tranId } = req.params;

		const order = await Order.findOne({ tran_id: tranId });

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
	} catch (error) {
		console.error("/payment/status/:tranId Error: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
