"use client";

interface StatusOverlayProps {
  isPending: boolean;
  isSuccess: boolean;
  pendingText?: string;
  successText?: string;
  onClose?: () => void;
}

export default function StatusOverlay({
  isPending,
  isSuccess,
  pendingText = "Сохраняем данные...",
  successText = "Данные успешно сохранены!",
  onClose,
}: StatusOverlayProps) {
  if (!isPending && !isSuccess) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg bg-white/95 p-6 text-center backdrop-blur-sm">
      {/* СОСТОЯНИЕ: ЗАГРУЗКА */}
      {isPending && (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 font-medium text-gray-700 animate-pulse">{pendingText}</p>
        </>
      )}

      {/* СОСТОЯНИЕ: УСПЕХ */}
      {!isPending && isSuccess && (
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="mt-4 font-semibold text-gray-800 text-lg">{successText}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors shadow-sm"
          >
            Готово
          </button>
        </div>
      )}
    </div>
  );
}
