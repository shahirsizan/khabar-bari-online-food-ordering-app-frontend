import { Router } from "express";

import { middleware } from "../middleware/middleware.js";
import { paymentController } from "../controller/paymentController.js";
import { loginUser, registerUser } from "../controller/authController.js";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

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
