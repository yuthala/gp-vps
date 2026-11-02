'use server'
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const INVENTORY_WAREHOUSES = ['Парфёнки', 'Юго-Северная'];

async function updateProductStockStatus(productId: string) {
    await sql`
        UPDATE products
        SET on_stock_status = CASE
            WHEN EXISTS (
                SELECT 1
                FROM inventory
                WHERE product_id = ${productId} AND quantity > 0
            ) THEN 'available'
            ELSE 'not_available'
        END
        WHERE id = ${productId};
    `;
    revalidatePath('/dashboard/product-cards');
}

export async function saveInventoryStock(productId: string, warehouseId: string, quantity: number) {
    if (!productId.trim()) {
        return { success: false as const, message: 'Не указан товар.' };
    }

    if (!INVENTORY_WAREHOUSES.includes(warehouseId)) {
        return { success: false as const, message: 'Выбран неизвестный склад.' };
    }

    if (!Number.isSafeInteger(quantity) || quantity < 0) {
        return { success: false as const, message: 'Количество должно быть целым неотрицательным числом.' };
    }

    try {
        const product = await sql`
            SELECT id FROM products WHERE id = ${productId} LIMIT 1;
        `;

        if (product.length === 0) {
            return { success: false as const, message: 'Товар не найден.' };
        }

        await sql`
            INSERT INTO inventory (product_id, warehouse_id, quantity, last_updated)
            VALUES (${productId}, ${warehouseId}, ${quantity}, NOW())
            ON CONFLICT (product_id, warehouse_id)
            DO UPDATE SET quantity = EXCLUDED.quantity, last_updated = NOW();
        `;

        await updateProductStockStatus(productId);
        return { success: true as const };
    } catch (error) {
        console.error('Не удалось сохранить остаток товара на складе:', error);
        return { success: false as const, message: 'Не удалось сохранить остаток. Попробуйте ещё раз.' };
    }
}

// 1. CREATE (Добавление начальных остатков для товара на складе)
export async function createInventoryStock(productId: string, warehouseId: string, quantity: number) {
    await sql`
        INSERT INTO inventory (product_id, warehouse_id, quantity, last_updated)
        VALUES (${productId}, ${warehouseId}, ${quantity}, NOW())
        ON CONFLICT (product_id, warehouse_id) DO NOTHING;
    `;
    await updateProductStockStatus(productId);
    console.log(`Запись остатка для товара ${productId} на складе ${warehouseId} создана.`);
}

// 2. READ (Получение остатков товара по всем складам или по конкретному складу)
export async function getInventoryStock(productId: string, warehouseId?: string) {
    if (warehouseId) {
        // Получить остаток на конкретном складе
        return await sql`
            SELECT id, product_id, quantity, warehouse_id, last_updated 
            FROM inventory 
            WHERE product_id = ${productId} AND warehouse_id = ${warehouseId};
        `;
    } else {
        // Получить остатки товара на всех складах
        return await sql`
            SELECT id, product_id, quantity, warehouse_id, last_updated 
            FROM inventory 
            WHERE product_id = ${productId};
        `;
    }
}

export async function getInventoryStocks(productIds: string[]) {
    if (productIds.length === 0) {
        return [];
    }

    return await sql<{ product_id: string; warehouse_id: string; quantity: number }[]>`
        SELECT product_id, warehouse_id, quantity
        FROM inventory
        WHERE product_id IN ${sql(productIds)};
    `;
}

// 3. UPDATE (Прямое обновление количества товара на складе)
export async function updateInventoryQuantity(productId: string, warehouseId: string, newQuantity: number) {
    await sql`
        UPDATE inventory 
        SET quantity = ${newQuantity}, last_updated = NOW()
        WHERE product_id = ${productId} AND warehouse_id = ${warehouseId};
    `;
    await updateProductStockStatus(productId);
    console.log(`Количество товара ${productId} на складе ${warehouseId} обновлено до ${newQuantity}.`);
}

// 4. DELETE (Удаление информации об остатках товара на конкретном складе)
export async function deleteInventoryStock(productId: string, warehouseId: string) {
    await sql`
        DELETE FROM inventory 
        WHERE product_id = ${productId} AND warehouse_id = ${warehouseId};
    `;
    await updateProductStockStatus(productId);
    console.log(`Запись остатков товара ${productId} со склада ${warehouseId} удалена.`);
}
