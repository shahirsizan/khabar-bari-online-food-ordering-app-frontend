import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

export const uploadImage = async (req, res) => {
	cloudinary.config({
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	});

	try {
		if (!req.file) {
			return res.status(400).json({ message: "No file found" });
		}

		const streamUpload = (fileBuffer) => {
			return new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{ folder: "Khabarbari" },
					(error, result) => {
						if (result) {
							resolve(result);
						} else {
							reject(error);
						}
					},
				);
				streamifier.createReadStream(fileBuffer).pipe(stream);
			});
		};

		const result = await streamUpload(req.file.buffer);
		res.status(200).json({ secure_url: result.secure_url }); // Returning just the URL
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
