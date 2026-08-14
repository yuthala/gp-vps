'use server'

import postgres from 'postgres';

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
interface NewProductInput {
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
async function addNewProduct(rawProduct: NewProductInput): Promise<void> {
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
  } catch (error) {
    console.error('[Ошибка] Не удалось сохранить товар:', error);
  }
}

