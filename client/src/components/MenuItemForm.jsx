import { useEffect, useState } from "react";
import EditableImage from "./EditableImage/EditableImage";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import { backend_base_url } from "../workMode";
import { toast } from "react-toastify";

export default function MenuItemForm({ whatToDo, menuItem }) {
	const navigate = useNavigate();
	const [image, setImage] = useState(menuItem?.image || "");
	const [name, setName] = useState(menuItem?.name || "");
	const [description, setDescription] = useState(menuItem?.description || "");
	const [basePrice, setBasePrice] = useState(menuItem?.basePrice || "");
	const [isLoading, setIsLoading] = useState(false);

	// Upon pressing the `Save` button.
	const handleFormSubmit = async (ev, data) => {
		ev.preventDefault();

		if (!image || !name || !description || !basePrice) {
			return toast.warn("দয়া করে সকল ফিল্ড পূরণ করুন।");
		}

		setIsLoading(true);

		const url =
			whatToDo === "edit"
				? `${backend_base_url}/api/menu-items/${menuItem._id}`
				: `${backend_base_url}/api/menu-items`;

		const methodd = whatToDo === "edit" ? "PUT" : "POST";

		try {
			const response = await apiFetch(url, {
				method: methodd,
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json", // This tells Express to parse req.body
					token: JSON.parse(localStorage.getItem("token")),
				},
			});

			if (response.ok) {
				const res = await response.json();
				toast.success(res.message);
				navigate("/profile/menu-items");
			}
		} catch (error) {
			console.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form
			onSubmit={(ev) =>
				handleFormSubmit(ev, {
					image,
					name,
					description,
					basePrice,
				})
			}
			className="mt-8 max-w-2xl mx-auto font-atma"
		>
			<div
				className="md:grid items-start gap-4"
				style={{ gridTemplateColumns: ".3fr .7fr" }}
			>
				<div>
					<EditableImage link={image} setLink={setImage} />
				</div>

				<div className="grow">
					<label>Item Name</label>
					<input
						type="text"
						value={name}
						onChange={(ev) => setName(ev.target.value)}
					/>

					<label>Description</label>
					<input
						type="text"
						value={description}
						onChange={(ev) => setDescription(ev.target.value)}
					/>

					<label>Price</label>
					<input
						type="text"
						value={basePrice}
						onChange={(ev) => setBasePrice(ev.target.value)}
					/>

					<button
						type="submit"
						className={`shadow-md mt-4 
							${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
					>
						Save
					</button>
				</div>
			</div>
		</form>
	);
}
