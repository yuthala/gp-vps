'use server';
import { CatalogSection, CatalogCard, ProductCard, CartItem, ShoppingCart, MiniProductCard } from "../lib/definitions";
import { cookies } from 'next/headers'

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

//import { signIn } from '@/auth';
//import { AuthError } from 'next-auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// export async function createInvoice(formData: FormData) {
//   const rawFormData = {
//     customerId: formData.get('customerId'),
//     amount: formData.get('amount'),
//     status: formData.get('status'),
//   };
//   // Test it out:
// 	console.log(typeof rawFormData.amount);
//   console.log(rawFormData);
// }

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

	 // If form validation fails, return errors early. Otherwise, continue.
	if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
	  // Test it out:
	// console.log(typeof rawFormData.amount);
  // console.log(rawFormData);

	// Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
	const amountInCents = amount * 100;
	const date = new Date().toISOString().split('T')[0];

	try {
		await sql`
    	INSERT INTO invoices (customer_id, amount, status, date)
    	VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
	} catch (error) {
		// We'll also log the error to the console for now
		console.error(error);
		return {
			message: 'Database Error: Failed to Create Invoice',
		};
	}

	revalidatePath('/dashboard/invoices');
	redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export async function updateInvoice(id: string, prevState: State, formData: FormData) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

	const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
	try {
		await sql`
			UPDATE invoices
			SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
			WHERE id = ${id}
		`;
	} catch (error) {
		// We'll also log the error to the console for now
		console.error(error);
		return {
			message: 'Database Error: Failed to Update Invoice',
		};
	}

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
	//throw new Error('Failed to Delete Invoice');
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

// export async function authenticate(
//   prevState: string | undefined,
//   formData: FormData,
// ) {
//   try {
//     await signIn('credentials', formData);
//   } catch (error) {
//     if (error instanceof AuthError) {
//       switch (error.type) {
//         case 'CredentialsSignin':
//           return 'Invalid credentials.';
//         default:
//           return 'Something went wrong.';
//       }
//     }
//     throw error;
//   }
// }

//страница Каталог
export async function getDataForCatalogPage() {
		const GarlicCards: CatalogCard[] = [
				{id: 'zubok', imageSrc: '/catalog/zubok.webp', title: 'Зубок'},
				{id: 'odnozubok', imageSrc: '/catalog/odnozubok.webp', title: 'Однозубок'},
				{id: 'bulb', imageSrc: '/catalog/bulb.webp', title: 'Воздушные луковицы'}
			];
			const OnionCards: CatalogCard[] = [
				{id: 'luksevok', imageSrc: '/catalog/sevok.webp', title: 'Лук севок'},
				{id: 'luckshernushka', imageSrc: '/catalog/seeds.webp', title: 'Семена'}
			];
			const ShalotCards: CatalogCard[] = [
				{id: 'shalotsevok', imageSrc: '/catalog/shalot.webp', title: 'Севок'},
				{id: 'shalotchernushka', imageSrc: '/catalog/seeds.webp', title: 'Семена'},
			]
		
			const sections: CatalogSection[] = [
				{
					title: 'чеснок',
					items: GarlicCards
				},
				{
					title: 'лук',
					items: OnionCards
				},
				{
					title: 'шалот',
					items: ShalotCards
				}
			];
		return {
			sections
		}
}

//компонент ProductCard
export async function getProductCard(pathName: string, cropName?: string) {

	const products: ProductCard[] = [
		{imageSrc: ['/products/lyubasha_zubok.webp', '/products/lyubasha.webp'], description: 'Описание Любаша зубок Описание Любаша зубок', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
			cropSort: 'Любаша', cropName: 'lyubasha', tags: ['#чеснок', '#зубок', '#Любаша'], packageSize: [2.5, 0, 10], cropSize: 'мелкая', pathName: 'zubok', onStockStatus: 'expected', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026',id: 1},
		{imageSrc: ['/products/bogatyr_zubok.webp', '/products/bogatyr.webp'], description: 'описание Богатырь зубок', descriptionDetails: 'Сорт “Богатырь” - озимый стрелкующийся сорт чеснока с особо крупной головкой. Сорт подмосковной селекции. Масса головки в среднем 90-100  г при соблюдении агротехники. Самые крупные головки имеют вес 130-150 г.<br/>Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
			cropName: 'bogatyr', cropSort: 'Богатырь', tags: ['#чеснок', '#зубок', '#Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'zubok', onStockStatus: 'available', price: 120, measureUnit: 100, id: 2},
		{imageSrc: ['/products/bogatyr_odnozubok.webp', '/products/bogatyr.webp'], description: 'Однозубок чеснока, сорт Богатырь, размер средний', descriptionDetails: 'Сорт “Богатырь” - озимый стрелкующийся сорт чеснока с особо крупной головкой. Сорт подмосковной селекции. Масса головки в среднем 90-100  г при соблюдении агротехники. Самые крупные головки имеют вес 130-150 г.<br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
			cropName: 'bogatyr', tags: ['#чеснок', '#однозубок', '#Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Богатырь', pathName: 'odnozubok', onStockStatus: 'available', price: 140, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 3},
		{imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'описание Шадейка однозубок', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
			cropName: 'shadeyka', cropSort: 'Шадейка', tags: ['#чеснок', '#однозубок', '#Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'not_available', price: 160, measureUnit: 100, id: 4},
		{imageSrc: ['/products/lyubasha_bulb.webp', '/products/lyubasha.webp'], description: 'описание Любаша бульбочки', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Рекомендуется раз в 3-4 года обновлять посевной материал путем размножения чеснока через бульбочки, чтобы избежать “вырождения” чеснока  и каждый год получать крупные и здоровые головки.', 
			cropSort: 'Любаша', cropName: 'lyubasha', tags: ['#чеснок', '#бульбочка', '#Любаша'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'available', price: 300, measureUnit: 100, id: 5},
		{imageSrc: ['/products/shadeyka_bulb.webp', '/products/shadeyka.webp'], description: 'описание Шадейка бульбочки', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Рекомендуется раз в 3-4 года обновлять посевной материал путем размножения чеснока через бульбочки, чтобы избежать “вырождения” чеснока  и каждый год получать крупные и здоровые головки.', 
			cropSort: 'Шадейка', cropName: 'shadeyka', tags: ['#чеснок', '#бульбочка', '#Шадейка'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'expected', price: 400, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 6},
		{imageSrc: ['/products/lyubasha_odnozubok.webp', '/products/lyubasha.webp'], description: 'описание Любаша однозубок', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
			cropName: 'lyubasha', cropSort: 'Любаша', tags: ['#чеснок', '#однозубок', '#Любаша'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'available', price: 120, measureUnit: 100, id: 7},
		{imageSrc: ['/products/komarov_odnozubok.webp', '/products/komarov.webp'], description: 'Однозубок чеснока, сорт Григорий Комаров, размер средний', descriptionDetails: 'Сорт “Григорий Комаров” - озимый стрелкующийся сорт чеснока с крупной головкой. Ароматный, вкус умеренно острый. Масса головки в среднем 90-100 г. Генетически устойчив к болезням. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
			cropName: 'komarov', tags: ['#чеснок', '#однозубок', '#ГригорийКомаров'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Григорий Комаров', pathName: 'odnozubok', onStockStatus: 'available', price: 150, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 8},
		{imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'Однозубок чеснока, сорт Шадейка, размер средний', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
			cropName: 'shadeyka', tags: ['#чеснок', '#однозубок', '#Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Шадейка', pathName: 'odnozubok', onStockStatus: 'expected', price: 150, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 9},
		{imageSrc: ['/products/hercules_medium.webp', '/products/hercules.webp'], description: 'Лук-севок, сорт Геркулес, средняя фракция', descriptionDetails: 'Сорт “Геркулес” - сорт лука красивого золотисто-желтого цвета. Обладает великолепным, чуть сладковатым вкусом без горечи. Раннеспелый - вегетационный период 75-90 дней. <br/> Лук-севок средней фракции универсального применения - из него можно получить как луковицу, так и зеленое перо.', 
			cropName: 'hercules', tags: ['#лук', '#Геркулес'], packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Геркулес', pathName: 'luksevok', onStockStatus: 'available', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 10},
		{imageSrc: ['/products/redbaron_small.webp', '/products/redbaron.webp'], description: 'Лук-севок, сорт Ред Барон, мелкая фракция', descriptionDetails: 'Сорт “Ред Барон” - сорт салатного лука голландской селекции. Обладает великолепным, чуть сладковатым вкусом и красивым красно-фиолетовым цветом. Используется в салатах и для гриля. Раннеспелый - вегетационный период 75-90 дней. <br/> Лук-севок мелкой фракции используется для выращивания лука на головку. Можно сажать как осенью, так и весной.', 
			cropName: 'redbaron', tags: ['#лук', '#РедБарон'], packageSize: [2.5, 5, 10], cropSize: 'мелкая', cropSort: 'Ред Барон', pathName: 'luksevok', onStockStatus: 'expected', price: 110, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 11},
		{imageSrc: ['/products/kwochka.webp'], description: 'Лук шалот, сорт Квочка, луковицы для размножения', descriptionDetails: 'Сорт “Квочка” - высокоурожайный раннеспелый сорт шалота, приспособленный для россиского климата. Обладает великолепным, чуть сладковатым вкусом. Растет "гнездом", многозачатковый. Для всех регионов. <br/> Крупные луковицы шалота используются для размножения шалота, так как из крупной луковицы вырастает "гнездо" с большим количеством луковичек. Можно сажать как осенью, так и весной.', 
			cropName: 'kwochka', tags: ['#шалот', '#Квочка'], packageSize: [2.5, 5, 10], cropSize: 'крупная', cropSort: 'Квочка', pathName: 'shalotsevok', onStockStatus: 'available', price: 200, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 12},
		{imageSrc: ['/products/cebrune_seeds.webp'], description: 'Лук шалот, сорт Цебруне, семена', descriptionDetails: 'Сорт “Цебруне” - высокоурожайный раннеспелый сорт шалота. Луковицы вытянутые, идеальны для салатов и гриля. Обладает великолепным, чуть сладковатым вкусом. Растет "гнездом", многозачатковый. Для выращивани в южных и центральных регионах. В северных широтах выращивают через рассаду.<br/> В первый год после посадки из семян вырастают небольшие луковички шалота. В 1 г содержится около 350 штук семян.', 
			cropName: 'cebrune', tags: ['#шалот', '#Цебруне'], packageSize: [2, 4, 10], cropSort: 'Цебруне', pathName: 'shalotchernushka', onStockStatus: 'available', price: 50, measureUnit: 1, estimatedOnStockDate: '10.08.2026', id: 13},
	];

	let res = products.filter((obj) => {
		return obj.pathName === pathName;
	});

	if(cropName) {
		res = res.filter((obj) => {
			return obj.cropName === cropName;
		})
	}
	const data = res[0]

	return {
		res, data, products
	}
}


// Функции с использованием cookies
const CART_NAME = 'shopping_cart'

export async function createNewCart() {
		const shoppingCart: ShoppingCart = {
		cartItems: []
	}
	const cookiesStore = await cookies()
	cookiesStore.set(CART_NAME,JSON.stringify(shoppingCart) )
}

// READ: Get the current cart
export async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies()
  const cartData = cookieStore.get(CART_NAME)?.value
	console.log(cartData)
  return cartData ? JSON.parse(cartData) : []
}

// CREATE / UPDATE: Add item to cart
export async function addToCart(product: CartItem) {
  const cart = await getCart()
  const existingItem = cart.find(item => item.id === product.id)

  let newCart;
  if (existingItem) {
    newCart = cart.map(item => 
      item.id === product.id ? { ...item, quantity: item.qty + 1 } : item
    )
  } else {
    newCart = [...cart, { ...product, quantity: 1 }]
  }

  const cookieStore = await cookies()
  cookieStore.set(CART_NAME, JSON.stringify(newCart), { path: '/' })
}

// UPDATE: Change quantity
export async function updateQuantity(id: number, quantity: number) {
  const cart = await getCart()
  const newCart = cart.map(item => 
    item.id === id ? { ...item, quantity } : item
  ).filter(item => item.qty > 0)

  const cookieStore = await cookies()
  cookieStore.set(CART_NAME, JSON.stringify(newCart), { path: '/' })
}

// DELETE: Remove item
export async function removeFromCart(id: number) {
  const cart = await getCart()
  const newCart = cart.filter(item => item.id !== id)
  
  const cookieStore = await cookies()
  cookieStore.set(CART_NAME, JSON.stringify(newCart), { path: '/' })
}

//Рекомендуемые товары
export async function getRecommendedProducts(products: ProductCard[]) {

	let recommendedProducts: MiniProductCard[] = [];

	recommendedProducts = [
		{id:9, imageSrc: '/recommendedProducts/rec1.webp', description: 'Однозубок чеснока, сорт Шадейка'},
		{id:8, imageSrc: '/recommendedProducts/rec2.webp', description: 'Однозубок чеснока, сорт Григорий Комаров'},
		{id:7, imageSrc: '/recommendedProducts/rec3.webp', description: 'Однозубок чеснока, крупной фракции, сорт Любаша'},
		{id: 3, imageSrc: '/recommendedProducts/rec4.webp', description: 'Отборный зубок чеснока, сорт Богатырь'},
		{id:5, imageSrc: '/recommendedProducts/rec5.webp', description: 'Воздушные луковицы чеснока, сорт Любаша'},
		{id:10,imageSrc: '/recommendedProducts/rec6.webp', description: 'Лук-севок, средняя фракция, сорт Геркулес'},
		{id:11, imageSrc: '/recommendedProducts/rec7.webp', description: 'Лук-севок, мелкая фракция, сорт Ред Барон'},
		{id:12, imageSrc: '/recommendedProducts/rec8.webp', description: 'Шалот, многозачатковый, сорт Квочка'},
		{id:13, imageSrc: '/recommendedProducts/rec9.webp', description: 'Семена шалота (чернушка), сорт Цебруне'},
	];

	products.map((product) => {
		recommendedProducts.map((recommendedProduct) => {
			if(product.id === recommendedProduct.id) {
				recommendedProduct.price = product.packageSize[0] * product.price;
				recommendedProduct.pathName = product.pathName;
				recommendedProduct.cropName = product.cropName;
			}
		})
	})
	return recommendedProducts;
}