import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import { RequestHandler } from "express";

/***
 * Initialize Cloudinary (No need to store the return value)
 * Because it configures a global singleton instance, the best practice in Node.js/Express
 * is to call cloudinary.config() once in server.ts right after the environment variables load.
 * Once done, we can simply import { v2 as cloudinary } anywhere else in our project and start
 * uploading instantly without needing to configure it over and over again.
 */
// ::: Moved to server.ts :::
// cloudinary.config({
// 	cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
// 	api_key: process.env.CLOUDINARY_API_KEY as string,
// 	api_secret: process.env.CLOUDINARY_API_SECRET as string,
// });

export const getPresignedSignature: RequestHandler<
	{},
	| {
			signature: string;
			timestamp: number;
			upload_preset: string;
			apiKey: string;
			cloudName: string;
	  }
	| { message: string }
> = async (req, res) => {
	try {
		const timestamp = Math.round(new Date().getTime() / 1000);
		const upload_preset = "khabarbari-upload-img-browser-to-cloudinary";

		// Generate the cryptographic signature
		const signature = cloudinary.utils.api_sign_request(
			{ timestamp, upload_preset },
			process.env.CLOUDINARY_API_SECRET as string,
		);

		res.json({
			signature: signature,
			timestamp: timestamp,
			upload_preset: upload_preset,
			apiKey: process.env.CLOUDINARY_API_KEY as string,
			cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
		});
	} catch (error: unknown) {
		console.log("Error in uploadController: ", error);
		res.status(500).json({ message: "getPresignedSignature error!" });
	}
};
