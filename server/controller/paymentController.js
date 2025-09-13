const axios = require("axios");
const paymentModel = require("../model/paymentModel.js");
const globals = require("node-global-storage");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

class paymentController {
	payment_create = async (req, res) => {
		const { amount, userId } = req.body;
		globals.setValue("userId", userId);

		try {
			const { data } = await axios.post(
				process.env.bkash_create_payment_url,
				{
					mode: "0011",
					payerReference: " ",
					// bkash UI theke cancel/confirm korle ei link e navigate korbe.
					// Mane bkash server amar server ke kon url e call korbe
					callbackURL: `${process.env.BACKEND_BASE_URL}/api/bkash/payment/callback`,
					amount: amount,
					currency: "BDT",
					intent: "sale",
					merchantInvoiceNumber: "Inv" + uuidv4().substring(0, 6),
				},
				{
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						Authorization: globals.getValue("id_token"),
						"X-App-Key": process.env.bkash_api_key,
					},
				}
			);
			// console.log(data);
			//   data = {
			//   paymentID: 'TR0011GEbQcp11749482802858',
			//   bkashURL: 'https://sandbox.payment.bkash.com/?paymentId=TR0011GEbQcp11749482802858&hash=M4wj!h2dAvqDScpymCZoFNic1Rp(ZGhmUs2Ll-PGBTA6Y3DjwqW.Ai2UVqsXDZE7R8vKTNqtS!Bk*jJh)eaQ8FF(IsuXSHVrQz-.1749482802858&mode=0011&apiVersion=v1.2.0-beta/',
			//   callbackURL: 'http://localhost:5000/bkash/payment/callback',
			//   successCallbackURL: 'http://localhost:5000/bkash/payment/callback?paymentID=TR0011GEbQcp11749482802858&status=success&signature=WL3lwYQlWP',
			//   failureCallbackURL: 'http://localhost:5000/bkash/payment/callback?paymentID=TR0011GEbQcp11749482802858&status=failure&signature=WL3lwYQlWP',
			//   cancelledCallbackURL: 'http://localhost:5000/bkash/payment/callback?paymentID=TR0011GEbQcp11749482802858&status=cancel&signature=WL3lwYQlWP',
			//   amount: '480',
			//   intent: 'sale',
			//   currency: 'BDT',
			//   paymentCreateTime: '2025-06-09T21:26:42:858 GMT+0600',
			//   transactionStatus: 'Initiated',
			//   merchantInvoiceNumber: 'Inva633b5',
			//   statusCode: '0000',
			//   statusMessage: 'Successful'
			// }

			return res.status(200).json({ bkashURL: data.bkashURL });
			// response back the `bkashURL` to frontend so that
			// user can be redirected to bkash UI.
			// note: upore `callbackURL` hocche bkash UI er kaj sheshe
			// bkash user ke jekhane redirected korbe setar URL.
		} catch (error) {
			return res.status(401).json({ error: error.message });
		}
	};

	call_back = async (req, res) => {
		const { paymentID, status } = req.query;
		// console.log("req: ", req);
		// console.log("req.query: ", req.query);

		if (status === "cancel" || status === "failure") {
			// console.log(req.query);
			// [Object: null prototype] {
			//   paymentID: 'TR0011ddv7cr11749621390834',
			//   status: 'failure',
			//   signature: 'qjtCago0G7',
			//   apiVersion: '1.2.0-beta/'
			// }

			return res.redirect(
				`${process.env.FRONTEND_BASE_URL}/error?message=${status}`
			);
		}

		if (status === "success") {
			// `createPayment` is successful.
			// Now time for `executePayment`
			try {
				const { data } = await axios.post(
					process.env.bkash_execute_payment_url,
					{
						paymentID: paymentID,
					},
					{
						headers: {
							Accept: "application/json",
							Authorization: globals.getValue("id_token"),
							"X-App-Key": process.env.bkash_api_key,
						},
					}
				);

				if (data && data.statusCode === "0000") {
					// means payment completed
					// return res.status().json();
					const userId = globals.getValue("userId");
					await paymentModel.create({
						userId: Math.random() * 10 + 1,
						amount: parseInt(data.amount),
						trxID: data.trxID,
						paymentID: data.paymentID,
						date: data.paymentExecuteTime,
					});

					// `executePayment` successfull, redirect to success page with trxId
					return res.redirect(
						`${process.env.FRONTEND_BASE_URL}/success?message=${status}&trxId=${data.trxID}`
					);
				} else {
					// `executePayment` not successfull
					return res.redirect(
						`${process.env.FRONTEND_BASE_URL}/error?message=${status}&messageFromMe=executePaymentUnsuccessfull`
					);
				}
			} catch (error) {
				return res.redirect(
					// error while performing `executePayment`
					`${process.env.FRONTEND_BASE_URL}/error?message=${error.message}`
				);
			}
		}
	};

	cashOnDelivery = async (req, res) => {};

	getPaymentInfo = async (req, res) => {
		try {
			const trxID = req.params.trxID;
			const paymentDetail = await paymentModel.findOne({ trxID: trxID });

			if (!paymentDetail) {
				return res
					.status(404)
					.json({ error: "Payment detail Not found" });
			}

			res.json({ paymentDetail });
		} catch (error) {
			res.json({ message: "Error in try-catch block!" });
		}
	};

	refund = async (req, res) => {};
}

module.exports = new paymentController();
