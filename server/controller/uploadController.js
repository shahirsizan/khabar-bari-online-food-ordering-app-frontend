import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import "dotenv/config";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getPresignedSignature = async (req, res) => {
	const timestamp = Math.round(new Date().getTime() / 1000);
	const upload_preset = "khabarbari-upload-img-browser-to-cloudinary";

	// Generate the cryptographic signature
	const signature = cloudinary.utils.api_sign_request(
		{ timestamp, upload_preset },
		cloudinary.config().api_secret,
	);

	res.json({
		signature: signature,
		timestamp: timestamp,
		upload_preset: upload_preset,
		apiKey: process.env.CLOUDINARY_API_KEY,
		cloudName: process.env.CLOUDINARY_CLOUD_NAME,
	});
};
