"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function DashboardForm() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<UserData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Автоматическая загрузка профиля при переходе на /user-dashboard
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/session/validate", { cache: "no-store" });
        if (!response.ok) throw new Error("Не удалось загрузить профиль");

        const body = await response.json();
        if (body.user) {
          setFormData({
            firstName: body.user.firstName || "",
            lastName: body.user.lastName || "",
            email: body.user.email || "",
            phone: body.user.phone || "",
          });
        } else {
          router.push("/login"); // Если сессия не найдена, отправляем на логин
        }
      } catch (error) {
        console.error("User dashboard profile load error", error);
        setMessage({ type: "error", text: "Ошибка при загрузке данных профиля." });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchUserProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Отправка измененных персональных данных на бэкенд
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || "Не удалось обновить данные.");
      }

      setMessage({ type: "success", text: "Данные успешно обновлены!" });
      setIsEditing(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Серверная ошибка при сохранении." });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Запрос на удаление аккаунта
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Вы уверены, что хотите навсегда удалить свой аккаунт? Это действие полностью необратимо."
    );
    if (!confirmed) return;

    setMessage(null);

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Не удалось удалить аккаунт.");
      }

      alert("Ваш аккаунт был успешно удален.");
      router.push("/"); // Роутим на главную страницу после удаления
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Ошибка при удалении аккаунта." });
    }
  };

  if (isLoading) {
    return <p className="text-gray-500 text-center py-4">Загрузка данных профиля...</p>;
  }

  return (
    <form onSubmit={handleSaveChanges} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Имя */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Имя</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!isEditing}
            className={clsx(
              "border p-2.5 rounded-lg outline-none transition-colors w-full",
              isEditing ? "focus:border-green-500 border-gray-300" : "bg-gray-50 border-gray-200 text-gray-500"
            )}
          />
        </div>

        {/*... Фамилия */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Фамилия</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!isEditing}
            className={clsx(
              "border p-2.5 rounded-lg outline-none transition-colors w-full",
              isEditing ? "focus:border-green-500 border-gray-300" : "bg-gray-50 border-gray-200 text-gray-500"
            )}
          />
        </div>

        {/* Номер телефона */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Номер телефона</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            className={clsx(
              "border p-2.5 rounded-lg outline-none transition-colors w-full",
              isEditing ? "focus:border-green-500 border-gray-300" : "bg-gray-50 border-gray-200 text-gray-500"
            )}
          />
        </div>

        {/* Почта */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-600">Электронная почта</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            className={clsx(
              "border p-2.5 rounded-lg outline-none transition-colors w-full",
              isEditing ? "focus:border-green-500 border-gray-300" : "bg-gray-50 border-gray-200 text-gray-500"
            )}
          />
        </div>
      </div>

      {message && (
        <p className={clsx("text-sm font-medium mt-1", message.type === "success" ? "text-green-600" : "text-red-500")}>
          {message.text}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg font-bold hover:bg-green-100 transition-colors text-sm uppercase cursor-pointer"
            >
              Изменить данные
            </button>
          ) : (
            <>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-sm uppercase cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setMessage(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm uppercase cursor-pointer"
              >
                Отмена
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm uppercase cursor-pointer sm:ml-auto"
        >
          Удалить аккаунт
        </button>
      </div>
    </form>
  );
}
