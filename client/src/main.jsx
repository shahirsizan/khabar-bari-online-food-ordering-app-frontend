import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./CartContext.jsx";
import { UserProvider } from "./UserContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<UserProvider>
			<CartProvider>
				<App />
			</CartProvider>
		</UserProvider>
	</BrowserRouter>,
);
