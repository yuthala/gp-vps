/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

// Инициализируем подключение к базе данных
const sql = postgres(process.env.DATABASE_URL!);

interface ProductInput {
  cropSort: string;
  cropName: string;
  tags: string[];
  packageSize: number[];
  pathName: string;
}

/**
 * Генерирует уникальный SKU ID, проверяя его наличие в базе данных PostgreSQL.
 * Если артикул уже занят, добавляет суффикс (-1, -2 и т.д.).
 */
async function generateUniqueSkuId(product: ProductInput): Promise<string> {
  // 1. Формируем базовую структуру артикула
  let cropCode = 'CRP';
  const hasGarlic = product.tags.some(tag => tag.toLowerCase().includes('чеснок'));
  if (hasGarlic || product.cropName.toLowerCase().includes('garlic')) {
    cropCode = 'GAR';
  }

  const sortCode = product.cropName.substring(0, 3).toUpperCase();
  const typeCode = product.pathName.substring(0, 3).toUpperCase();
  
  const weight = product.packageSize[0] ?? 0;
  const weightCode = `${weight.toString().replace('.', '')}K`;

  // Базовый артикул, например: GAR-LYU-ZUB-25K
  const baseSku = `${cropCode}-${sortCode}-${typeCode}-${weightCode}`;
  
  let finalSku = baseSku;
  let counter = 1;
  let isUnique = false;

  // 2. Цикл проверки уникальности в PostgreSQL
  while (!isUnique) {
    // Делаем быстрый запрос благодаря индексу по колонке id
    const existing = await sql`
      SELECT id FROM products WHERE id = ${finalSku} LIMIT 1
    `;

    // Если товар с таким SKU не найден, значит артикул свободен
    if (existing.length === 0) {
      isUnique = true;
    } else {
      // Если дубликат найден, добавляем счетчик: GAR-LYU-ZUB-25K-1
      finalSku = `${baseSku}-${counter}`;
      counter++;
    }
  }
  return finalSku;
}


// 1. Описываем структуру входящего товара (заменяем any)
export interface NewProductInput {
  imageSrc: string[];
  description: string;
  descriptionDetails: string;
  cropSort: string;
  cropName: string;
  tags: string[];
  packageSize: number[];
  cropSize: string;
  pathName: string;
  onStockStatus: 'in_stock' | 'out_of_stock' | 'pre_order'; // Строгие литеральные типы
  price: number;
  measureUnit: number;
  estimatedOnStockDate: string;
}

// 2. Используем созданный интерфейс в параметрах функции
export async function addNewProduct(rawProduct: NewProductInput): Promise<{ success: boolean; sku?: string; error?: string }> {
  // Генерируем гарантированно уникальный SKU
  const uniqueSku = await generateUniqueSkuId(rawProduct);

  try {
    await sql`
      INSERT INTO products (
        id, image_src, description, description_details, crop_sort, 
        crop_name_eng, tags, package_size, crop_size, path_name_eng, 
        on_stock_status, price, measure_unit, estimated_on_stock_date
      ) VALUES (
        ${uniqueSku}, 
        ${rawProduct.imageSrc}, 
        ${rawProduct.description}, 
        ${rawProduct.descriptionDetails}, 
        ${rawProduct.cropSort}, 
        ${rawProduct.cropName}, 
        ${rawProduct.tags}, 
        ${rawProduct.packageSize}, 
        ${rawProduct.cropSize}, 
        ${rawProduct.pathName}, 
        ${rawProduct.onStockStatus}, 
        ${rawProduct.price}, 
        ${rawProduct.measureUnit}, 
        ${rawProduct.estimatedOnStockDate}
      );
    `;
    console.log(`[Успех] Товар добавлен с SKU: ${uniqueSku}`);
    return { success: true, sku: uniqueSku };

  } catch (error: any) {
    console.error('[Ошибка] Не удалось сохранить товар:', error);
    return { success: false, error: error.message || 'Не удалось сохранить' };
  }
}


// Описываем структуру товара, которую возвращает база данных
export interface ProductRow {
  internal_id: string;
  id: string; // SKU
  crop_sort: string;
  crop_name_eng: string;
  price: number;
  estimated_on_stock_date: string | null;
  on_stock_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  image_src: string[];
}

const ITEMS_PER_PAGE = 6; // Количество товаров на одной странице

/**
 * Получение списка товаров с учетом поиска и пагинации
 */
export async function fetchFilteredProducts(query: string, currentPage: number): Promise<ProductRow[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Поиск идет по артикулу (id), названию сорта или тегам благодаря индексам
    const products = await sql<ProductRow[]>`
      SELECT internal_id, id, crop_sort, crop_name_eng, price, estimated_on_stock_date, on_stock_status, image_src
      FROM products
      WHERE 
        id ILIKE ${'%' + query + '%'} OR
        crop_sort ILIKE ${'%' + query + '%'} OR
        crop_name_eng ILIKE ${'%' + query + '%'}
      ORDER BY created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    
    return products;
  } catch (error) {
    console.error('Ошибка при чтении товаров:', error);
    throw new Error('Не удалось загрузить список товаров.');
  }
}

/**
 * Подсчет общего количества страниц для пагинации
 */
export async function fetchProductsPages(query: string): Promise<number> {
  try {
    const data = await sql`
      SELECT COUNT(*) as count
      FROM products
      WHERE 
        id ILIKE ${'%' + query + '%'} OR
        crop_sort ILIKE ${'%' + query + '%'} OR
        crop_name_eng ILIKE ${'%' + query + '%'}
    `;

    const totalItems = Number(data[0]?.count ?? 0);
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Ошибка при подсчете страниц:', error);
    throw new Error('Не удалось подсчитать количество страниц.');
  }
}

/**
 * Удаление товара по его внутреннему UUID
 */
export async function deleteProduct(internalId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sql`
      DELETE FROM products WHERE internal_id = ${internalId}
    `;
    
    // Сбрасываем кэш Next.js для этой страницы, чтобы таблица сразу обновилась
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    return { success: false, error: 'Не удалось удалить товар из базы данных.' };
  }
}
