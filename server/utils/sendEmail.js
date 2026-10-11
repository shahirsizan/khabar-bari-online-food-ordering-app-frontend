/***
 * No nodemailer.
 * We'll be using `resend` from now on.
 */
// import { createTransport } from "nodemailer";
// import "dotenv/config";

// const sendEmail = async (options) => {
// 	// 1. Create a transporter using the details of khabar bari email
// 	const transporter = createTransport({
// 		host: "smtp.gmail.com",
// 		port: 465,
// 		secure: false,
// 		family: 4, // Forces IPv4
// 		auth: {
// 			user: process.env.KHABARBARI_EMAIL,
// 			pass: process.env.KHABARBARI_EMAIL_PASS,
// 		},
// 		tls: {
// 			// Bypasses self-signed certificate errors during development
// 			// We should not keep rejectUnauthorized: false in production.
// 			// For detail on what to do in production, ask gemini.
// 			rejectUnauthorized: false,
// 			servername: "smtp.gmail.com",
// 		},
// 	});

// 	// 2. Define the users provided email details
// 	const mailOptions = {
// 		from: `Khabar Bari | <${process.env.KHABARBARI_EMAIL}>`, // Sender
// 		to: options.email, // Receiver
// 		subject: options.subject, // Subject
// 		text: options.message, // Body
// 	};

// 	// 3. Send email
// 	await transporter.sendMail(mailOptions);
// };

// export default sendEmail;

import { Resend } from "resend";
import "dotenv/config";

// interface EmailOptions {
// 	email: string;
// 	subject: string;
// 	message: string;
// }

// Initialize the API engine directly bypassing buggy SMTP protocols
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
	try {
		await resend.emails.send({
			from: "Khabar Bari <onboarding@resend.dev>", // Free tier domain default
			to: options.email,
			replyTo: "khabarbari.restaurant125@gmail.com",
			subject: options.subject,
			text: options.message,
		});
		console.log("Email delivered successfully via Resend API platform!");
	} catch (error) {
		console.error("Resend delivery engine failed: ", error);
		throw new Error("Failed to dispatch password reset notification.");
	}
};

export default sendEmail;
