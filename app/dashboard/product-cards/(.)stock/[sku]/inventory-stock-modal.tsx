'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, PackagePlus } from 'lucide-react';
import { saveInventoryStock } from '@/app/lib/dbActions/inventoryDBActions';

const WAREHOUSES = ['Парфёнки', 'Юго-Северная'];

interface InventoryQuantity {
  warehouseId: string;
  quantity: number;
}

interface InventoryStockModalProps {
  sku: string;
  initialQuantities: InventoryQuantity[];
}

export default function InventoryStockModal({ sku, initialQuantities }: InventoryStockModalProps) {
  const router = useRouter();
  const [warehouseId, setWarehouseId] = useState(WAREHOUSES[0]);
  const [quantity, setQuantity] = useState(() => (
    initialQuantities.find((item) => item.warehouseId === WAREHOUSES[0])?.quantity ?? 0
  ));
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const closeModal = () => {
    router.push('/dashboard/product-cards');
    router.refresh();
  };

  const handleWarehouseChange = (nextWarehouseId: string) => {
    setWarehouseId(nextWarehouseId);
    setQuantity(initialQuantities.find((item) => item.warehouseId === nextWarehouseId)?.quantity ?? 0);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const saveResult = await saveInventoryStock(sku, warehouseId, quantity);
      setResult({
        success: saveResult.success,
        message: saveResult.success
          ? `Остаток товара на складе «${warehouseId}» успешно сохранен.`
          : saveResult.message,
      });
    } catch (error) {
      console.error('Не удалось выполнить сохранение остатка:', error);
      setResult({
        success: false,
        message: 'Не удалось сохранить остаток. Попробуйте ещё раз.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <button
        type="button"
        aria-label="Закрыть окно"
        onClick={closeModal}
        className="absolute inset-0 cursor-default"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-modal-title"
        className="relative w-full max-w-sm transform rounded-2xl border border-gray-100 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
      >
        {result ? (
          <div className="text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${result.success ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {result.success ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <h2 id="inventory-modal-title" className="mb-2 text-lg font-bold text-gray-900">
              {result.success ? 'Остаток сохранен!' : 'Не удалось сохранить остаток'}
            </h2>
            <p className="mb-5 text-sm text-gray-500">{result.message}</p>
            <button
              type="button"
              onClick={closeModal}
              className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition-all active:scale-[0.98] ${result.success ? 'bg-[#14a34a] shadow-md shadow-emerald-600/10 hover:bg-[#118c3f]' : 'bg-rose-600 shadow-md shadow-rose-600/10 hover:bg-rose-700'}`}
            >
              Отлично
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 id="inventory-modal-title" className="text-lg font-bold text-gray-900">Остаток на складе</h2>
                <p className="font-mono text-xs text-gray-500">{sku}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Склад</span>
                <select
                  value={warehouseId}
                  onChange={(event) => handleWarehouseChange(event.target.value)}
                  disabled={isSaving}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {WAREHOUSES.map((warehouse) => (
                    <option key={warehouse} value={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Количество</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value === '' ? 0 : Number(event.target.value))}
                  disabled={isSaving}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-[#14a34a] px-4 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/10 transition-all hover:bg-[#118c3f] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
