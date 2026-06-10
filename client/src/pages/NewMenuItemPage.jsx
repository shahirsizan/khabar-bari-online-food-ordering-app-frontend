import React from "react";
import { useState } from "react";
import MenuItemForm from "../components/MenuItemForm";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const NewMenuItemPage = () => {
	const navigate = useNavigate();

	return (
		<section className="mt-8 max-w-2xl mx-auto">
			<div className="max-w-2xl mx-auto mt-8">
				{/* 2️⃣ ei link click korle back to `/menu-items` route */}
				<button
					className="flex items-center justify-center border shadow-md px-3 py-2 rounded-md"
					onClick={() => {
						navigate("/profile/menu-items");
					}}
				>
					<FaArrowLeft />
					<span>Show all menu items</span>
				</button>
			</div>

			<div className="mt-8">
				<MenuItemForm whatToDo={"new"} menuItem={null} />
			</div>
		</section>
	);
};

export default NewMenuItemPage;
