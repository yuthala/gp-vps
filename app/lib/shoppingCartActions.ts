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

export async function createShoppingCart(cartItem: CartItem) {
	const savedCartData = localStorage.getItem('cartKey');
	if (savedCartData) {
		const parsedCart: ShoppingCart = JSON.parse(savedCartData);
		const cartItemexists = parsedCart.cartItems.filter(item => item.id === cartItem.id).filter(item => item.packageSize === cartItem.packageSize)
		console.log('cartItem exists :', cartItemexists )

		if (cartItemexists.length != 0) {
			console.log('changing quantity')
				for (let i:number = 0; i < parsedCart.cartItems.length; i++) {
				if (parsedCart.cartItems[i].id === cartItem.id && parsedCart.cartItems[i].packageSize === cartItem.packageSize) {
					parsedCart.cartItems[i].qty += cartItem.qty
					parsedCart.cartItems[i].totalSum = parsedCart.cartItems[i].qty * parsedCart.cartItems[i].price
					localStorage.setItem('cartKey', JSON.stringify(parsedCart));

					console.log('Sshopping cart updated')
				} 
		  }
		} else {
			parsedCart.cartItems.push(cartItem);
			localStorage.setItem('cartKey', JSON.stringify(parsedCart));
		  console.log('cartItemAdded')
		}
		//localStorage.setItem('cartKey', JSON.stringify(parsedCart));
	} else {
		//создаем пустую корзину
			const shoppingCart:ShoppingCart = {
				cartItems: []
			}
			if (typeof window !== 'undefined') {
				localStorage.setItem('cartKey', JSON.stringify(shoppingCart));
			}
		}
}

export async function updateCartItemByIndex(index: number, qty: number) {
		console.log('localStorage', localStorage);
		const savedCartData = localStorage.getItem('cartKey');
			if (savedCartData) {
		const parsedCart: ShoppingCart = JSON.parse(savedCartData);
		parsedCart.cartItems[index].qty = qty;
		localStorage.setItem('cartKey', JSON.stringify(parsedCart));
	} 
}

//Удалить все элементы из корзины. Вызывает при добавлении в корзину
export async function deleteAllCartItems() {
	const savedCartData = localStorage.getItem('cartKey');
		if (savedCartData) {
			const shoppingCart:ShoppingCart = { cartItems: [] };
			localStorage.setItem('cartKey', JSON.stringify(shoppingCart));
		}
}