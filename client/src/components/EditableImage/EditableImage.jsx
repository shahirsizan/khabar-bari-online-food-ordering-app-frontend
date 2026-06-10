import React from "react";

export default function EditableImage({ link, setLink }) {
	async function handleFileChange(ev) {
		if (ev.target.files?.length === 1) {
			const data = new FormData();
			data.set("file", ev.target.files[0]);

			const uploadPromise = fetch("http://localhost:5000/api/upload", {
				method: "POST",
				body: data,
				headers: {
					token: JSON.parse(localStorage.getItem("token")),
				},
			}).then(async (response) => {
				if (response.ok) {
					const res = await response.json();
					console.log("res.secure_url: ", res.secure_url);

					// Assuming your backend returns the link in a field like 'link'
					setLink(res.secure_url);
				} else {
					throw new Error("Something went wrong");
				}
			});
		}
	}

	return (
		<>
			{/* Logic Fix: check 'link' (the prop string), not 'Link' (the imported component) */}
			{link && (
				<img
					className="rounded-lg w-full h-full mb-1"
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
					onChange={handleFileChange}
				/>
				<span className="block border border-gray-300 rounded-lg p-2 text-center cursor-pointer">
					Change image
				</span>
			</label>
		</>
	);
}
