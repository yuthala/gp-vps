import { getInventoryStock } from '@/app/lib/dbActions/inventoryDBActions';
import InventoryStockModal from './inventory-stock-modal';

interface PageProps {
  params: Promise<{ sku: string }>;
}

export default async function InventoryStockPage({ params }: PageProps) {
  const { sku } = await params;
  const inventory = await getInventoryStock(sku);

  return (
    <InventoryStockModal
      sku={sku}
      initialQuantities={inventory.map(({ warehouse_id, quantity }) => ({
        warehouseId: warehouse_id,
        quantity,
      }))}
    />
  );
}
