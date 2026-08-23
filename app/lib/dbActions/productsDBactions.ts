'use server'

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import type { ProductCard } from '../definitions';

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
 * 
 * Опциональный параметр currentInternalId позволяет исключить текущий редактируемый 
 * товар из проверки уникальности (чтобы он не конфликтовал сам с собой, если SKU не менялся).
 */
async function generateUniqueSkuId(product: ProductInput, currentInternalId?: string): Promise<string> {
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
    // Проверяем, занят ли SKU кем-то другим, кроме текущего редактируемого товара
    const existing = currentInternalId 
      ? await sql`SELECT id FROM products WHERE id = ${finalSku} AND internal_id != ${currentInternalId} LIMIT 1`
      : await sql`SELECT id FROM products WHERE id = ${finalSku} LIMIT 1`;

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
  onStockStatus: 'available' | 'not_available' | 'expected'; // Строгие литеральные типы
  price: number;
  measureUnit: number;
  estimatedOnStockDate: string;
}

// Интерфейс для обновления товара (все поля становятся опциональными, кроме internal_id)
export interface UpdateProductInput extends Partial<NewProductInput> {
  internalId: string;
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
    revalidatePath('/catalog', 'page'); // Обнуление cache страниц /catalog/...
    return { success: true, sku: uniqueSku };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Ошибка] Не удалось сохранить товар:', error);
    return { success: false, error: error.message || 'Не удалось сохранить' };
  }
}

/**
 * Функция редактирования товара по его внутреннему internal_id
 */
export async function updateProduct(updatedFields: UpdateProductInput): Promise<{ success: boolean; sku?: string; error?: string }> {
  const { internalId, ...fields } = updatedFields;

  try {
    // 1. Сначала получаем текущие данные товара из базы, чтобы достроить SKU, если поменялась только часть полей
    const currentRows = await sql`
      SELECT id, crop_sort, crop_name_eng, tags, package_size, path_name_eng FROM products WHERE internal_id = ${internalId} LIMIT 1
    `;
    
    if (currentRows.length === 0) {
      return { success: false, error: 'Товар для обновления не найден.' };
    }
    
    const currentProduct = currentRows[0];

    // 2. Собираем данные для генерации SKU (новые изменения + старые значения, если они не менялись)
    const productForSkuGen: ProductInput = {
      cropSort: fields.cropSort ?? currentProduct.crop_sort,
      cropName: fields.cropName ?? currentProduct.crop_name_eng,
      tags: fields.tags ?? currentProduct.tags,
      packageSize: fields.packageSize ?? currentProduct.package_size,
      pathName: fields.pathName ?? currentProduct.path_name_eng,
    };

    // Генерируем уникальный SKU с учетом исключения текущего товара из дубликатов
    const newSku = await generateUniqueSkuId(productForSkuGen, internalId);

    // 3. Выполняем динамическое обновление полей, которые были переданы
    await sql`
      UPDATE products SET
        id = ${newSku},
        image_src = ${fields.imageSrc ?? sql`image_src`},
        description = ${fields.description ?? sql`description`},
        description_details = ${fields.descriptionDetails ?? sql`description_details`},
        crop_sort = ${productForSkuGen.cropSort},
        crop_name_eng = ${productForSkuGen.cropName},
        tags = ${productForSkuGen.tags},
        package_size = ${productForSkuGen.packageSize},
        crop_size = ${fields.cropSize ?? sql`crop_size`},
        path_name_eng = ${productForSkuGen.pathName},
        on_stock_status = ${fields.onStockStatus ?? sql`on_stock_status`},
        price = ${fields.price ?? sql`price`},
        measure_unit = ${fields.measureUnit ?? sql`measure_unit`},
        estimated_on_stock_date = ${fields.estimatedOnStockDate ?? sql`estimated_on_stock_date`}
      WHERE internal_id = ${internalId}
    `;

    console.log(`[Успех] Товар c ID ${internalId} успешно обновлен. Новый SKU: ${newSku}`);

    // Сбрасываем кэш страниц, чтобы администратор и пользователи сразу увидели изменения
    revalidatePath('/dashboard/product-cards');
    revalidatePath(`/dashboard/products/${internalId}`); // Если у вас есть страница редактирования конкретного товара
    revalidatePath('/catalog', 'page'); // Обнуление cache страниц /catalog/...

    return { success: true, sku: newSku };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('[Ошибка] Не удалось обновить товар:', error);
    return { success: false, error: error.message || 'Не удалось обновить данные товара.' };
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
  on_stock_status: 'available' | 'not_available' | 'expected';
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
 * Получение списка товаров, отфильтрованных по конкретному path_name_eng, с учетом пагинации
 */
export async function fetchProductsByPathName(pathName: string, currentPage: number): Promise<ProductRow[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    // Выбираем товары, у которых колонка path_name_eng полностью совпадает с переданным значением
    const products = await sql<ProductRow[]>`
      SELECT internal_id, id, crop_sort, crop_name_eng, price, estimated_on_stock_date, on_stock_status, image_src
      FROM products
      WHERE path_name_eng = ${pathName}
      ORDER BY created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;
    
    return products;
  } catch (error) {
    console.error(`Ошибка при чтении товаров для пути ${pathName}:`, error);
    throw new Error('Не удалось загрузить список товаров для данной категории.');
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
    revalidatePath('/dashboard/product-cards');
    revalidatePath('/catalog', 'page'); // Обнуление cache страниц /catalog/...
    return { success: true };
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    return { success: false, error: 'Не удалось удалить товар из базы данных.' };
  }
}


/**
 * Получение полных данных одного товара по его внутреннему UUID для формы редактирования
 */
export async function fetchProductByInternalId(internalId: string): Promise<NewProductInput & { internal_id: string; id: string } | null> {
  try {
    const data = await sql`
      SELECT 
        internal_id, id, image_src as "imageSrc", description, 
        description_details as "descriptionDetails", crop_sort as "cropSort", 
        crop_name_eng as "cropName", tags, package_size as "packageSize", 
        crop_size as "cropSize", path_name_eng as "pathName", 
        on_stock_status as "onStockStatus", price, measure_unit as "measureUnit", 
        estimated_on_stock_date as "estimatedOnStockDate"
      FROM products 
      WHERE internal_id = ${internalId} 
      LIMIT 1
    `;

    if (data.length === 0) return null;

    // Приводим типы из БД к интерфейсу (массивы и даты)
    const product = data[0];
    return {
      ...product,
      packageSize: Array.isArray(product.packageSize) ? product.packageSize : [Number(product.packageSize)],
      estimatedOnStockDate: product.estimatedOnStockDate 
        ? new Date(product.estimatedOnStockDate).toISOString().split('T')[0] 
        : '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  } catch (error) {
    console.error('Ошибка при получении товара по ID:', error);
    throw new Error('Не удалось загрузить данные товара.');
  }
}

/**
 * Получение абсолютно всех товаров из базы данных без ограничений, пагинации и выборки
 */
export async function fetchAllProducts(): Promise<ProductCard[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await sql<any[]>`
      SELECT 
        id,
        image_src,
        description,
        description_details,
        crop_sort,
        crop_size,
        crop_name_eng,
        path_name_eng,
        tags,
        package_size,
        on_stock_status,
        estimated_on_stock_date,
        price,
        measure_unit
      FROM products 
      ORDER BY on_stock_status DESC
    `;

    return products.map((row, index) => { // Добавили index для подстраховки
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return [val]; }
    }
    return [];
  };

  // Проверяем, преобразуется ли id в число. Если нет — используем index
  const parsedId = Number(row.id);
  const safeId = Number.isNaN(parsedId) ? index : parsedId;

  return {
    id: safeId, // Теперь здесь точно никогда не будет NaN
    imageSrc: parseArray(row.image_src),
    description: row.description || '',
    descriptionDetails: row.description_details || '',
    cropSort: row.crop_sort || '',
    cropSize: row.crop_size || undefined,
    cropName: row.crop_name_eng || '',
    pathName: row.path_name || 'zubok',
    tags: row.tags ? parseArray(row.tags) : [],
    packageSize: parseArray(row.package_size).map(Number),
    onStockStatus: row.on_stock_status as 'available' | 'not_available' | 'expected', 
    estimatedOnStockDate: row.estimated_on_stock_date ? String(row.estimated_on_stock_date) : undefined,
    price: Number(row.price),
    measureUnit: Number(row.measure_unit || 1),
  };
});


  } catch (error) {
    console.error('Ошибка при получении полного списка товаров из БД:', error);
    throw new Error('Не удалось загрузить все товары.');
  }
}


/* Для главной страницы надо 8 случайных товаров из БД. Свойства:
-- где есть пагинация реализовать promise.all
*/

// Загрузка восьми случайных элементов из БД для главной страницы
export async function fetchRandomProducts(): Promise<ProductCard[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await sql<any[]>`
      SELECT 
        id,
        image_src,
        description,
        description_details,
        crop_sort,
        crop_size,
        crop_name_eng,
        path_name_eng,
        tags,
        package_size,
        on_stock_status,
        estimated_on_stock_date,
        price,
        measure_unit
      FROM products 
      WHERE on_stock_status = 'available'
      ORDER BY RANDOM() 
      LIMIT 8
    `;

    return products.map((row, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parseArray = (val: any) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try { return JSON.parse(val); } catch { return [val]; }
        }
        return [];
      };

      const parsedId = Number(row.id);
      const safeId = Number.isNaN(parsedId) ? index : parsedId;

      return {
        id: safeId,
        imageSrc: parseArray(row.image_src),
        description: row.description || '',
        descriptionDetails: row.description_details || '',
        cropSort: row.crop_sort || '',
        cropSize: row.crop_size || undefined,
        cropName: row.crop_name_eng || '',
        pathName: row.path_name_eng || 'zubok', // Изменено на row.path_name_eng, так как это поле запрашивается в SELECT
        tags: row.tags ? parseArray(row.tags) : [],
        packageSize: parseArray(row.package_size).map(Number),
        onStockStatus: row.on_stock_status as 'available' | 'not_available' | 'expected', 
        estimatedOnStockDate: row.estimated_on_stock_date ? String(row.estimated_on_stock_date) : undefined,
        price: Number(row.price),
        measureUnit: Number(row.measure_unit || 1),
      };
    });

  } catch (error) {
    console.error('Ошибка при получении случайных товаров из БД:', error);
    //throw new Error('Не удалось загрузить случайные товары.');
    // В случае ошибки возвращаем пустой массив вместо ошбибки, чтобы страница не падала. 
    return []
  }
}


