import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	ReactNode,
} from "react";

export interface CartItem {
	id: string;
	name: string;
	price: number;
	image?: string;
	quantity: number;
	[key: string]: any; // optional extra (not-important) fields
}

type CartActionType =
	| {
			type: "ADD_ITEM";
			payload: { item: Omit<CartItem, "quantity">; quantity: number };
	  }
	| { type: "REMOVE_ITEM"; payload: { itemId: string } }
	| {
			type: "UPDATE_QUANTITY";
			payload: { itemId: string; newQuantity: number };
	  }
	| { type: "CLEAR_CART" };

interface CartContextType {
	cartItems: CartItem[];
	addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
	removeFromCart: (itemId: string) => void;
	updateQuantity: (itemId: string, newQuantity: number) => void;
	cartTotal: number;
	totalItemsCount: number;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

// CART-REDUCER
const cartReducer = (state: CartItem[], action: CartActionType): CartItem[] => {
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
			return [...state, { ...item, quantity: quantity } as CartItem];
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

/***
 * Initialize cart from localstorage || Start fresh []
 */
const initializer = (): CartItem[] => {
	try {
		const localData = localStorage.getItem("cart");
		return localData ? JSON.parse(localData) : [];
	} catch (error) {
		console.error(
			"⚠️ CartContext: LocalStorage cache corrupted. Resetting cart items state: ",
			error,
		);
		localStorage.removeItem("cart");
		return [];
	}
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [cartItems, dispatch] = useReducer(cartReducer, [], initializer);

	// console.log("from cartContext.jsx. Cart is: ", cartItems);

	/***
	 * Save updated cart state in localstorage (during initial load AND on every subsequent cart update)
	 */
	useEffect(() => {
		localStorage.setItem("cart", JSON.stringify(cartItems));
	}, [cartItems]);

	const cartTotal = cartItems.reduce(
		(total, item) => total + item.price * item.quantity,
		0,
	);

	const totalItemsCount = cartItems.reduce(
		(sum, item) => sum + item.quantity,
		0,
	);

	const addToCart = useCallback(
		(item: Omit<CartItem, "quantity">, quantity: number) => {
			dispatch({ type: "ADD_ITEM", payload: { item, quantity } });
		},
		[],
	);

	const removeFromCart = useCallback((itemId: string) => {
		dispatch({ type: "REMOVE_ITEM", payload: { itemId } });
	}, []);

	const updateQuantity = useCallback(
		(itemId: string, newQuantity: number) => {
			dispatch({
				type: "UPDATE_QUANTITY",
				payload: { itemId, newQuantity },
			});
		},
		[],
	);

	const clearCart = useCallback(() => {
		dispatch({ type: "CLEAR_CART" });
	}, []);

	const values = {
		cartItems,
		addToCart,
		removeFromCart,
		updateQuantity,
		cartTotal,
		totalItemsCount,
		clearCart,
	};

	return (
		<CartContext.Provider value={values}>{children}</CartContext.Provider>
	);
};

export const useCart = (): CartContextType => {
	const context = useContext(CartContext);
	/***
	 * Added a check to prevent entire application from crashing if this Provider is missing.
	 */
	if (!context) {
		throw new Error(
			"cartContext is missing! Or must be called from within a <CartProvider/> component",
		);
	}

	return context;
};
