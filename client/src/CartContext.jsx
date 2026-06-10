import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
const CartContext = createContext();

// CART-REDUCER
const cartReducer = (state, action) => {
	switch (action.type) {
		case "ADD_ITEM": {
			// accepts [item, quantity]
			const { item, quantity } = action.payload;
			const existingItem = state.find((i) => i.id === item.id);
			if (existingItem) {
				return state.map((i) =>
					i.id === item.id ? { ...i, quantity: quantity } : i,
				);
			}
			return [...state, { ...item, quantity: quantity }];
		}
		case "REMOVE_ITEM": {
			// accepts [itemId]
			return state.filter((i) => i.id !== action.payload.itemId);
		}
		case "UPDATE_QUANTITY": {
			// accepts [itemId, newQuantity]
			const { itemId, newQuantity } = action.payload;
			return state.map((i) =>
				i.id === itemId
					? { ...i, quantity: Math.max(1, newQuantity) }
					: i,
			);
		}
		case "CLEAR_CART": {
			return [];
		}
		default:
			return state;
	}
};

// initialize cart from localstorage
const initializer = () => {
	return localStorage.getItem("cart")
		? JSON.parse(localStorage.getItem("cart"))
		: [];
};

export const CartProvider = ({ children }) => {
	const [cartItems, dispatch] = useReducer(cartReducer, [], initializer);

	const [showPaymentOptionsModal, setShowPaymentOptionsModal] =
		useState(false);
	const [paymentMethod, setPaymentMethod] = useState("");
	// console.log("from cartContext.jsx. Cart is: ", cartItems);

	//  persist cart state in localstorage (during initial load AND on every subsequent cart update)
	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(cartItems));
	}, [cartItems]);

	// calculate total cost
	const cartTotal = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);

	// calculate total items count
	const totalItemsCount = cartItems.reduce(
		(sum, item) => sum + item.quantity,
		0,
	);

	//  dispatcher wrapped with useCallback for performance (stable reference between renders)
	const addToCart = useCallback((item, quantity) => {
		dispatch({ type: "ADD_ITEM", payload: { item, quantity } });
	}, []);

	const removeFromCart = useCallback((itemId) => {
		dispatch({ type: "REMOVE_ITEM", payload: { itemId } });
	}, []);

	const updateQuantity = useCallback((itemId, newQuantity) => {
		dispatch({ type: "UPDATE_QUANTITY", payload: { itemId, newQuantity } });
	}, []);

	const clearCart = useCallback(() => {
		dispatch({ type: "CLEAR_CART" });
	}, []);

	return (
		<CartContext.Provider
			value={{
				cartItems,
				addToCart,
				removeFromCart,
				updateQuantity,
				cartTotal,
				totalItemsCount,
				showPaymentOptionsModal,
				setShowPaymentOptionsModal,
				paymentMethod,
				setPaymentMethod,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = () => {
	const context = useContext(CartContext);

	/***
	 * To prevent the entire application from crashing if this Provider is intentionally/accidentally removed
	 * in the future, add a check inside the `useCart` hook.
	 */
	if (context === undefined) {
		throw new Error("useCart must be called from within a CartProvider");
	}

	return context;
};
