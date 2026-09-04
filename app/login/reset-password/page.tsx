"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { lusitana } from "@/app/ui/fonts";
import StatusOverlay from "@/app/ui/dashboard/StatusOverlay";
import ErrorOverlay from "@/app/ui/dashboard/ErrorOverlay";

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Состояния интерфейса
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Защита от ботов (Honeypot)
  const [botTrap, setBotTrap] = useState("");

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (botTrap) return setError("Действие заблокировано");

    if (!token) {
      setError("Токен восстановления отсутствует в URL-адресе.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (password.length < 6) {
      setError("Пароль слишком короткий (минимум 6 символов)");
      return;
    }

    setIsPending(true);

    try {
      const resp = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const body = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(body?.error || "Не удалось сбросить пароль.");
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Сетевая ошибка при отправке запроса.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative rounded-lg bg-white p-6 shadow-md border border-gray-100">
      {/* Оверлей загрузки и успеха (вытянут по вертикали, кнопка узкая) */}
      <StatusOverlay
        isPending={isPending}
        isSuccess={isSuccess}
        pendingText="Обновляем пароль учетной записи..."
        successText="Пароль успешно изменен!"
        onClose={() => router.push("/login")} // По кнопке Готово уводим на логин
      />

      {/* Оверлей критической ошибки сервера */}
      <ErrorOverlay
        error={error}
        onRetry={() => setError(null)}
        redirectPath="/login"
        redirectButtonText="Назад к авторизации"
      />

      {/* Невидимое поле для ботов */}
      <div className="opacity-0 absolute -z-10 pointer-events-none" aria-hidden="true">
        <input
          type="text"
          value={botTrap}
          onChange={(e) => setBotTrap(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <h2 className={`${lusitana.className} text-xl font-bold text-gray-900 mb-2`}>
        Установка нового пароля
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Придумайте новый надежный пароль для вашей учетной записи.
      </p>

      <form onSubmit={handleResetSubmit} className="grid gap-4">
        <label className="grid gap-1 text-sm font-medium">
          Новый пароль
          <input
            name="password"
            type="password"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
            placeholder="••••••"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          Подтвердите пароль
          <input
            name="confirmPassword"
            type="password"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
            placeholder="••••••"
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 rounded-md bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isPending ? "Сохранение..." : "Сохранить новый пароль"}
        </button>
      </form>
    </div>
  );
}

// Корневой экспортируемый компонент с обязательной оберткой Suspense для useSearchParams в Next.js
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen justify-center p-6 pt-20 md:pt-30 bg-gray-50">
      <div className="w-full max-w-md flex flex-col justify-center">
        <Suspense fallback={<p className="text-center text-sm text-gray-500">Загрузка формы...</p>}>
          <ResetPasswordFormContent />
        </Suspense>
      </div>
    </div>
  );
}
