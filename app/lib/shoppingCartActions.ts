import { ProductCard, CartItem, ShoppingCart, MiniProductCard } from "./definitions";

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
		const cartItemexists = parsedCart.cartItems.filter(item => item.id === cartItem.id).filter(item => item.packageSize === cartItem.packageSize);
		console.log('cartItem exists :', cartItemexists )

		if (cartItemexists.length != 0) {
			for (let i:number = 0; i < parsedCart.cartItems.length; i++) {
				if (parsedCart.cartItems[i].id === cartItem.id && parsedCart.cartItems[i].packageSize === cartItem.packageSize) {
					parsedCart.cartItems[i].qty += cartItem.qty
					parsedCart.cartItems[i].totalSum = parsedCart.cartItems[i].qty * parsedCart.cartItems[i].price
					localStorage.setItem('cartKey', JSON.stringify(parsedCart));
				} 
		  }
		} else {
			parsedCart.cartItems.push(cartItem);
			localStorage.setItem('cartKey', JSON.stringify(parsedCart));
		}
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

export async function updateCartItemById(cartItem: CartItem) {
		const savedCartData = localStorage.getItem('cartKey');
			if (savedCartData) {
		const parsedCart: ShoppingCart = JSON.parse(savedCartData);
			for (let i:number = 0; i < parsedCart.cartItems.length; i++) {
			if (parsedCart.cartItems[i].id === cartItem.id && parsedCart.cartItems[i].packageSize === cartItem.packageSize) {
				parsedCart.cartItems[i].qty = cartItem.qty;
				parsedCart.cartItems[i].totalSum = parsedCart.cartItems[i].qty * parsedCart.cartItems[i].price;
				localStorage.setItem('cartKey', JSON.stringify(parsedCart));
						console.log('from function', parsedCart.cartItems);
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

//Удалить все элементы из корзины. Вызываетcz при добавлении в корзину
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

// export async function getProductCardClient(pathName: string, cropName?: string) {

// 	const products: ProductCard[] = [
// 		{imageSrc: ['/products/lyubasha_zubok.webp', '/products/lyubasha.webp'], description: 'Описание Любаша зубок Описание Любаша зубок', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
// 			cropSort: 'Любаша', cropName: 'lyubasha', tags: ['#чеснок', '#зубок', '#Любаша'], packageSize: [2.5, 0, 10], cropSize: 'мелкая', pathName: 'zubok', onStockStatus: 'expected', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026',id: 1},
// 		{imageSrc: ['/products/bogatyr_zubok.webp', '/products/bogatyr.webp'], description: 'описание Богатырь зубок', descriptionDetails: 'Сорт “Богатырь” - озимый стрелкующийся сорт чеснока с особо крупной головкой. Сорт подмосковной селекции. Масса головки в среднем 90-100  г при соблюдении агротехники. Самые крупные головки имеют вес 130-150 г.<br/>Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
// 			cropName: 'bogatyr', cropSort: 'Богатырь', tags: ['#чеснок', '#зубок', '#Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'zubok', onStockStatus: 'available', price: 120, measureUnit: 100, id: 2},
// 		{imageSrc: ['/products/bogatyr_odnozubok.webp', '/products/bogatyr.webp'], description: 'Однозубок чеснока, сорт Богатырь, размер средний', descriptionDetails: 'Сорт “Богатырь” - озимый стрелкующийся сорт чеснока с особо крупной головкой. Сорт подмосковной селекции. Масса головки в среднем 90-100  г при соблюдении агротехники. Самые крупные головки имеют вес 130-150 г.<br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
// 			cropName: 'bogatyr', tags: ['#чеснок', '#однозубок', '#Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Богатырь', pathName: 'odnozubok', onStockStatus: 'available', price: 140, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 3},
// 		{imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'описание Шадейка однозубок', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
// 			cropName: 'shadeyka', cropSort: 'Шадейка', tags: ['#чеснок', '#однозубок', '#Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'not_available', price: 160, measureUnit: 100, id: 4},
// 		{imageSrc: ['/products/lyubasha_bulb.webp', '/products/lyubasha.webp'], description: 'описание Любаша бульбочки', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Рекомендуется раз в 3-4 года обновлять посевной материал путем размножения чеснока через бульбочки, чтобы избежать “вырождения” чеснока  и каждый год получать крупные и здоровые головки.', 
// 			cropSort: 'Любаша', cropName: 'lyubasha', tags: ['#чеснок', '#бульбочка', '#Любаша'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'available', price: 300, measureUnit: 100, id: 5},
// 		{imageSrc: ['/products/shadeyka_bulb.webp', '/products/shadeyka.webp'], description: 'описание Шадейка бульбочки', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Рекомендуется раз в 3-4 года обновлять посевной материал путем размножения чеснока через бульбочки, чтобы избежать “вырождения” чеснока  и каждый год получать крупные и здоровые головки.', 
// 			cropSort: 'Шадейка', cropName: 'shadeyka', tags: ['#чеснок', '#бульбочка', '#Шадейка'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'expected', price: 400, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 6},
// 		{imageSrc: ['/products/lyubasha_odnozubok.webp', '/products/lyubasha.webp'], description: 'описание Любаша однозубок', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
// 			cropName: 'lyubasha', cropSort: 'Любаша', tags: ['#чеснок', '#однозубок', '#Любаша'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'available', price: 1200, measureUnit: 100, id: 7},
// 		{imageSrc: ['/products/komarov_odnozubok.webp', '/products/komarov.webp'], description: 'Однозубок чеснока, сорт Григорий Комаров, размер средний', descriptionDetails: 'Сорт “Григорий Комаров” - озимый стрелкующийся сорт чеснока с крупной головкой. Ароматный, вкус умеренно острый. Масса головки в среднем 90-100 г. Генетически устойчив к болезням. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
// 			cropName: 'komarov', tags: ['#чеснок', '#однозубок', '#ГригорийКомаров'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Григорий Комаров', pathName: 'odnozubok', onStockStatus: 'expected', price: 150, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 8},
// 		{imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'Однозубок чеснока, сорт Шадейка, размер средний', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
// 			cropName: 'shadeyka', tags: ['#чеснок', '#однозубок', '#Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Шадейка', pathName: 'odnozubok', onStockStatus: 'available', price: 150, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 9},
// 		{imageSrc: ['/products/hercules_medium.webp', '/products/hercules.webp'], description: 'Лук-севок, сорт Геркулес, средняя фракция', descriptionDetails: 'Сорт “Геркулес” - сорт лука красивого золотисто-желтого цвета. Обладает великолепным, чуть сладковатым вкусом без горечи. Раннеспелый - вегетационный период 75-90 дней. <br/> Лук-севок средней фракции универсального применения - из него можно получить как луковицу, так и зеленое перо.', 
// 			cropName: 'hercules', tags: ['#лук', '#Геркулес'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Геркулес', pathName: 'luksevok', onStockStatus: 'available', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 10},
// 		{imageSrc: ['/products/redbaron_small.webp', '/products/redbaron.webp'], description: 'Лук-севок, сорт Ред Барон, мелкая фракция', descriptionDetails: 'Сорт “Ред Барон” - сорт салатного лука голландской селекции. Обладает великолепным, чуть сладковатым вкусом и красивым красно-фиолетовым цветом. Используется в салатах и для гриля. Раннеспелый - вегетационный период 75-90 дней. <br/> Лук-севок мелкой фракции используется для выращивания лука на головку. Можно сажать как осенью, так и весной.', 
// 			cropName: 'redbaron', tags: ['#лук', '#РедБарон'], packageSize: [2.5, 5, 10], cropSize: 'мелкая', cropSort: 'Ред Барон', pathName: 'luksevok', onStockStatus: 'expected', price: 110, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 11},
// 		{imageSrc: ['/products/kwochka.webp'], description: 'Лук шалот, сорт Квочка, луковицы для размножения', descriptionDetails: 'Сорт “Квочка” - высокоурожайный раннеспелый сорт шалота, приспособленный для россиского климата. Обладает великолепным, чуть сладковатым вкусом. Растет "гнездом", многозачатковый. Для всех регионов. <br/> Крупные луковицы шалота используются для размножения шалота, так как из крупной луковицы вырастает "гнездо" с большим количеством луковичек. Можно сажать как осенью, так и весной.', 
// 			cropName: 'kwochka', tags: ['#шалот', '#Квочка'], packageSize: [2.5, 5, 10], cropSize: 'крупная', cropSort: 'Квочка', pathName: 'shalotsevok', onStockStatus: 'available', price: 200, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 12},
// 		{imageSrc: ['/products/cebrune_seeds.webp'], description: 'Лук шалот, сорт Цебруне, семена', descriptionDetails: 'Сорт “Цебруне” - высокоурожайный раннеспелый сорт шалота. Луковицы вытянутые, идеальны для салатов и гриля. Обладает великолепным, чуть сладковатым вкусом. Растет "гнездом", многозачатковый. Для выращивани в южных и центральных регионах. В северных широтах выращивают через рассаду.<br/> В первый год после посадки из семян вырастают небольшие луковички шалота. В 1 г содержится около 350 штук семян.', 
// 			cropName: 'cebrune', tags: ['#шалот', '#Цебруне'], packageSize: [2, 4, 10], cropSort: 'Цебруне', pathName: 'shalotchernushka', onStockStatus: 'available', price: 50, measureUnit: 1, estimatedOnStockDate: '10.08.2026', id: 13},
// 	];

// 	let res = products.filter((obj) => {
// 		return obj.pathName === pathName;
// 	});

// 	if(cropName) {
// 		res = res.filter((obj) => {
// 			return obj.cropName === cropName;
// 		})
// 	}
// 	const data = res[0];

// 	return {
// 		res, data, products
// 	}
// }

