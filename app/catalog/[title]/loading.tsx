// app/catalog/loading.tsx
export default function CatalogLoading() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 animate-pulse">
      {/* Крутящийся круг (спиннер) */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
      
      <h3 className="mt-4 text-lg font-bold text-gray-900">
        Обновляем ассортимент
      </h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs">
        Подключаемся к базе данных и загружаем актуальные карточки товаров...
      </p>
    </div>
  );
}
