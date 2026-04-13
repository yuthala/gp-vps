
import { ProductCard, CartItem, ShoppingCart } from "./definitions";

// Корзина
export async function createCartItem (data: ProductCard, packageSize: number, qty: number) {
	const cartItem = {
		id: data.id,
		imageSrc: data.imageSrc[0],
		description: data.description,
		packageSize: packageSize,
		price: data.price * packageSize,
		qty: Number(qty),
		totalSum: data.price * packageSize * (Number(qty) || 1),
		measureUnit: data.measureUnit
	}
	return cartItem;
}

//создание корзины и добавление в корзину
export async function createShoppingCart(cartItem: CartItem) {
	const savedCartData = localStorage.getItem('cartKey');
	if (savedCartData) {
		const parsedCart: ShoppingCart = JSON.parse(savedCartData);
		const existingItemIndex = parsedCart.cartItems.findIndex(item => item.id === cartItem.id && item.packageSize === cartItem.packageSize);

		if (existingItemIndex != -1) {
				//check if an identical item already exists in the cart
					parsedCart.cartItems[existingItemIndex].qty += cartItem.qty //increase qty
					parsedCart.cartItems[existingItemIndex].totalSum = parsedCart.cartItems[existingItemIndex].qty * parsedCart.cartItems[existingItemIndex].price //update totalSum
					localStorage.setItem('cartKey', JSON.stringify(parsedCart)); //save the updated cart back to localStorage
		} else { //if an identical item doesn't exist in the cart
			parsedCart.cartItems.push(cartItem); //adds the new item to the cart's cartItems array
			localStorage.setItem('cartKey', JSON.stringify(parsedCart)); //save the updated cart to localStorage
		}
	} else {
		//создаем пустую корзину, если корзина не создана
			const shoppingCart:ShoppingCart = {
				cartItems: [] //Creates a new empty shopping cart
			}
			if (typeof window !== 'undefined') {
				localStorage.setItem('cartKey', JSON.stringify(shoppingCart)); //saves cart to localStorage
			}
		}
}

export async function updateCartItemById(cartItem: CartItem) {
		const savedCartData = localStorage.getItem('cartKey');
			if (savedCartData) {
		const parsedCart: ShoppingCart = JSON.parse(savedCartData);
			for (let i:number = 0; i < parsedCart.cartItems.length; i++) {
			if (parsedCart.cartItems[i].id === cartItem.id && parsedCart.cartItems[i].packageSize === cartItem.packageSize) {
				parsedCart.cartItems[i].qty = cartItem.qty;
				parsedCart.cartItems[i].totalSum = parsedCart.cartItems[i].qty * parsedCart.cartItems[i].price;
				localStorage.setItem('cartKey', JSON.stringify(parsedCart));
			} 
		}
	} 
}

export async function updateTotalSumInUI(cartItem: CartItem) {
	let data: number = 0;
	const savedCartData = localStorage.getItem('cartKey');
		if (savedCartData) {
	const parsedCart: ShoppingCart = JSON.parse(savedCartData);
		for (let i:number = 0; i < parsedCart.cartItems.length; i++) {
			if (parsedCart.cartItems[i].id === cartItem.id && parsedCart.cartItems[i].packageSize === cartItem.packageSize) {
				data = parsedCart.cartItems[i].totalSum;
			}
		}
	}
	return data;
}

//очищение корзины после checkout
export async function clearShoppingCart() {
    // Check if window is defined to prevent errors during Server-Side Rendering
    if (typeof window !== 'undefined') {
        const emptyCart: ShoppingCart = {
            cartItems: []
        };
        
        // Overwrite the existing cart with the empty one
        localStorage.setItem('cartKey', JSON.stringify(emptyCart));
    }
}

//Удалить все элементы из корзины. Вызываетcя при добавлении в корзину
export async function deleteAllCartItems() {
	const savedCartData = localStorage.getItem('cartKey');
		if (savedCartData) {
			const shoppingCart:ShoppingCart = { cartItems: [] };
			localStorage.setItem('cartKey', JSON.stringify(shoppingCart));
		}
}

// Удалить item из корзины по нажатии на кнопку 
export async function deleteItemFromCart(cartItem: CartItem) {
	const savedCartData = localStorage.getItem('cartKey');
		if (savedCartData) {
			const parsedCart: ShoppingCart = JSON.parse(savedCartData);
			for (let i:number = 0; i < parsedCart.cartItems.length; i++) {
			if (parsedCart.cartItems[i].id === cartItem.id && parsedCart.cartItems[i].packageSize === cartItem.packageSize) {
				parsedCart.cartItems.splice(i, 1)
				console.log('cart item deleted from cart')
				localStorage.setItem('cartKey', JSON.stringify(parsedCart));
			}
		}
	}
}
