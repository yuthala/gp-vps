

// "use client";

// interface ErrorOverlayProps {
//   error: string | null;
//   onRetry: () => void;
// }

// export default function ErrorOverlay({ error, onRetry }: ErrorOverlayProps) {
//   if (!error) return null;

//   return (
//     /* ИСПРАВЛЕНО: fixed inset-0 и затемненный бэкдроп на весь экран */
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      
//       {/* Карточка модального окна ошибки */}
//       <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
//         <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
//           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
//           </svg>
//         </div>
        
//         <p className="mt-4 font-bold text-gray-900 text-lg">Ошибка удаления</p>
//         <p className="mt-2 text-sm text-gray-500 max-w-xs">{error}</p>
        
//         <div className="mt-6 w-full">
//           <button
//             type="button"
//             onClick={onRetry}
//             className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
//           >
//             Закрыть и исправить
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/ui/dashboard/ErrorOverlay.tsx
"use client";

import { useRouter } from "next/navigation";

// 1. Расширяем интерфейс пропсов, делая новые параметры опциональными
interface ErrorOverlayProps {
  error: string | null;
  onRetry: () => void;
  redirectPath?: string;        // Значок ? делает пропс необязательным
  redirectButtonText?: string;  // Значок ? делает пропс необязательным
}

export default function ErrorOverlay({
  error,
  onRetry,
  // 2. Указываем дефолтные значения на случай, если пропсы не переданы (например, в таблице клиентов)
  redirectPath = "/dashboard/customers",
  redirectButtonText = "К списку клиентов",
}: ErrorOverlayProps) {
  const router = useRouter();

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        
        <p className="mt-4 font-bold text-gray-900 text-lg">Ошибка операции</p>
        <p className="mt-2 text-sm text-gray-500 max-w-xs">{error}</p>
        
        <div className="mt-6 flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            Попробовать снова
          </button>
          <button
            type="button"
            onClick={() => router.push(redirectPath)}
            className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {redirectButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

