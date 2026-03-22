// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.

import { JSX } from "react/jsx-dev-runtime";

// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CardInfo = {
	imageSrc: string;
	imagePosition: string;
	heading: string;
	popularSorts: string[];
	generations?: string[];
	linkSort?: string;
	linkSortName: string;
	linkCrops?: string;
	linkCropsName: string;
}

export type Advantages = {
	iconSrc: string;
	iconWidth?: number;
	iconHeight?: number;
	heading: string;
	description: string | JSX.Element;
}

export type Delivery = {
	imageSrc: string;
	imageDescription: string;
}

export type CatalogSection = {
	title: string;
	items: CatalogCard[];
}

export type CatalogCard = {
	id: string; // название на латинице для маршрута в строке поиска
	imageSrc: string;
	title: string;
}

export type ProductCard = {
	imageSrc: string[];
	description: string;
	descriptionDetails: string;
	cropSort: string;
	cropSize?: 'мелкая' | 'средняя' | 'крупная' | '4-9 мм';
	cropName: string;
	pathName: 'zubok' | 'odnozubok' | 'bulb' | 'luksevok' | 'luckshernushka' | 'shalotsevok' | 'shalotchernushka'; //из actions.ts
	tags?: string[];
	packageSize: number[];
	onStockStatus: 'available' | 'not_available' | 'expected';
	estimatedOnStockDate?: string;
	price: number;
	measureUnit: number;
	id: number
}

export type ShoppingCart = {
	cartItems: CartItem[];
}

export type CartItem = {
	id: number;
	imageSrc: string;
	description: string;
	packageSize: number;
	price: number;
	qty: number;
	totalSum: number;
	measureUnit: number;
}

export type MiniProductCard = {
	id?: number;
	imageSrc: string;
	description: string;
	price?: number;
	pathName?: string;
	cropName?: string;
}




