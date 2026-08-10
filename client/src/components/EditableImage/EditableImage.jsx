import React from "react";
import { apiFetch } from "../../utils/api";
import { backend_base_url } from "../../workMode";

export default function EditableImage({ link, setLink }) {
	const [isLoading, setIsLoading] = React.useState(false);

	const handleFileChange = async (ev) => {
		if (ev.target.files?.length === 0) {
			return alert("Please select an image first!");
		}

		setIsLoading(true);

		try {
			// 1. Fetch authentication parameters from your Express backend
			const response = await apiFetch(
				`${backend_base_url}/api/get-presigned-signature`,
				{
					method: "GET",
					headers: {
						token: JSON.parse(localStorage.getItem("token")),
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to fetch upload signature.");
			}

			const data = await response.json();
			const { signature, timestamp, upload_preset, apiKey, cloudName } =
				data;

			// 2. Prepare the multipart form data for direct Cloudinary upload
			const formData = new FormData();
			formData.append("file", ev.target.files[0]); // The selected file
			formData.append("api_key", apiKey);
			formData.append("timestamp", timestamp);
			formData.append("signature", signature);
			formData.append("upload_preset", upload_preset);

			// 3. Post directly to Cloudinary endpoint bypassing our backend
			const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
			const uploadResponse = await apiFetch(cloudinaryUrl, {
				method: "POST",
				body: formData, // Do NOT set Content-Type header; fetch handles boundaries automatically with FormData
			});

			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json();
				throw new Error(
					errorData.error?.message ||
						"Direct Cloudinary upload failed",
				);
			}

			const uploadResult = await uploadResponse.json();
			console.log(
				"Direct Cloudinary upload secure_url: ",
				uploadResult.secure_url,
			);

			setLink(uploadResult.secure_url); // Update the parent component's state with the new image URL
		} catch (error) {
			console.error("Error uploading file: ", error.message);
			alert(error.message || "Something went wrong during the upload.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="font-atma font-semibold">
			{/* Logic Fix: check 'link' (the prop string), not 'Link' (the imported component) */}
			{link && (
				<img
					className="rounded-lg w-full h-full mb-3 shadow-lg"
					src={link}
					width={250}
					height={250}
					alt={"avatar"}
				/>
			)}

			{!link && (
				<div className="text-center bg-gray-200 p-4 text-gray-500 rounded-lg mb-1">
					No image
				</div>
			)}

			<label>
				<input
					type="file"
					className="hidden"
					onChange={(ev) => {
						handleFileChange(ev);
					}}
					disabled={isLoading} // Disable input while loading
				/>
				<span
					className={`block border border-gray-300 rounded-lg p-2 text-center cursor-pointer 
						${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
				>
					Change image
				</span>
			</label>
		</div>
	);
}
