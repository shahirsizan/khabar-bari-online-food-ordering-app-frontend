import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./CartContext.jsx";
import { UserProvider } from "./UserContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<CartProvider>
			<UserProvider>
				<ToastContainer
					position="bottom-right"
					autoClose={4000}
					hideProgressBar={false}
					newestOnTop={true}
					closeOnClick
					closeButton={false}
					rtl={false}
					pauseOnFocusLoss
					draggable={false}
					pauseOnHover
				/>
				<App />
			</UserProvider>
		</CartProvider>
	</BrowserRouter>,
);
