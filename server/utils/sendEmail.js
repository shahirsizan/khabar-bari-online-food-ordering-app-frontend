import { createTransport } from "nodemailer";
import "dotenv/config";

const sendEmail = async (options) => {
	// 1. Create a transporter using the details of khabar bari email
	const transporter = createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		family: 4, // Forces IPv4
		auth: {
			user: process.env.KHABARBARI_EMAIL,
			pass: process.env.KHABARBARI_EMAIL_PASS,
		},
		tls: {
			// Bypasses self-signed certificate errors during development
			// We should not keep rejectUnauthorized: false in production.
			// For detail on what to do in production, ask gemini.
			rejectUnauthorized: false,
		},
	});

	// 2. Define the users provided email details
	const mailOptions = {
		from: `Khabar Bari | <${process.env.KHABARBARI_EMAIL}>`, // Sender
		to: options.email, // Receiver
		subject: options.subject, // Subject
		text: options.message, // Body
	};

	// 3. Send email
	await transporter.sendMail(mailOptions);
};

export default sendEmail;
