import { useEffect, useState } from "react";
import EditableImage from "./EditableImage/EditableImage";
import { useNavigate } from "react-router-dom";

export default function MenuItemForm({ whatToDo, menuItem }) {
	const navigate = useNavigate();
	const [image, setImage] = useState(menuItem?.image || "");
	const [name, setName] = useState(menuItem?.name || "");
	const [description, setDescription] = useState(menuItem?.description || "");
	const [basePrice, setBasePrice] = useState(menuItem?.basePrice || "");

	async function handleFormSubmit(ev, data) {
		ev.preventDefault();

		const url =
			whatToDo === "edit"
				? `http://localhost:5000/api/menu-items/${menuItem._id}`
				: "http://localhost:5000/api/menu-items";

		const methodd = whatToDo === "edit" ? "PUT" : "POST";

		console.log("url & methodd: ", url, " ", methodd);

		try {
			const response = await fetch(url, {
				method: methodd,
				body: JSON.stringify(data),
				headers: {
					"Content-Type": "application/json", // This tells Express to parse req.body
					token: JSON.parse(localStorage.getItem("token")),
				},
			});

			if (response.ok) {
				const res = await response.json();
				// console.log("Item saved to database successfully: ", res);
				navigate("/profile/menu-items");
			}
		} catch (error) {
			console.error(error.message);
		}
	}

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
			className="mt-8 max-w-2xl mx-auto"
		>
			<div
				className="md:grid items-start gap-4"
				style={{ gridTemplateColumns: ".3fr .7fr" }}
			>
				<div>
					<EditableImage link={image} setLink={setImage} />
				</div>

				<div className="grow">
					<label>Item name</label>
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

					<label>Base price</label>
					<input
						type="text"
						value={basePrice}
						onChange={(ev) => setBasePrice(ev.target.value)}
					/>

					<button type="submit">Save</button>
				</div>
			</div>
		</form>
	);
}
