'use server';
import { CatalogSection, CatalogCard, ProductCard } from "../lib/definitions";

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
		{imageSrc: ['/products/lyubasha_zubok.webp', '/products/lyubasha.webp'], description: 'Описание Любаша зубок Описание Любаша зубок', cropSort: 'Любаша', cropName: 'lyubasha', tag: ['чеснок', 'зубок', 'Любаша'], packageSize: [2.5, 0, 10], cropSize: 'мелкая', pathName: 'zubok', onStockStatus: 'expected', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026'},
		{imageSrc: ['/products/bogatyr_zubok.webp', '/products/bogatyr.webp'], description: 'описание Богатырь зубок', cropName: 'bogatyr', cropSort: 'Богатырь', tag: ['чеснок', 'зубок', 'Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'zubok', onStockStatus: 'available', price: 120, measureUnit: 100},
		{imageSrc: ['/products/bogatyr_odnozubok.webp', '/products/bogatyr.webp'], description: 'Однозубок чеснока, сорт Богатырь, размер средний', cropName: 'bogatyr', tag: ['чеснок', 'однозубок', 'Богатырь'],packageSize: [2.5, 5, 10], cropSize: 'средняя', cropSort: 'Богатырь', pathName: 'odnozubok', onStockStatus: 'available', price: 140, measureUnit: 100, estimatedOnStockDate: '10.08.2026'},
		{imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'описание Шадейка однозубок', cropName: 'shadeyka', cropSort: 'Шадейка', tag: ['чеснок', 'однозубок', 'Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'not_available', price: 160, measureUnit: 100},
		{imageSrc: ['/products/lyubasha_bulb.webp', '/products/lyubasha.webp'], description: 'описание Любаша бульбочки', cropSort: 'Любаша', cropName: 'lyubasha', tag: ['чеснок', 'бульбочка', 'Любаша'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'available', price: 300, measureUnit: 100},
		{imageSrc: ['/products/shadeyka_bulb.webp', '/products/shadeyka.webp'], description: 'описание Шадейка бульбочки', cropSort: 'Шадейка', cropName: 'shadeyka', tag: ['чеснок', 'бульбочка', 'Шадейка'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'expected', price: 400, measureUnit: 100, estimatedOnStockDate: '10.08.2026'},
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
		res, data
	}
}