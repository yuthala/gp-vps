export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="flex flex-col items-center">
        {/* Красивый зеленый спиннер, соответствующий стилю ваших кнопок */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
          Загрузка страницы авторизации…
        </p>
      </div>
    </div>
  );
}
