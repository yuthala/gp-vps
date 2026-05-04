"use client";
//import { lusitana } from '@/app/ui/fonts';
import React from 'react';
import {
  AtSymbolIcon,
  KeyIcon,
  //ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button-login';

export default function LoginForm({
  onSubmit,
  onSignUp,
}: {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onSignUp?: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [isSignUp, setIsSignUp] = React.useState(false);

  return (
    <form onSubmit={isSignUp ? onSignUp : onSubmit} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 border border-gray-200 px-6 pb-4 pt-8">
        <h1 className="pb-3 text-2xl font-semibold text-foreground">
          {isSignUp ? 'Зарегистрироваться' : 'Введите ваш логин и пароль'}
        </h1>
        {isSignUp && (
          <div>
            <label
              className="py-2 block text-sm font-medium text-foreground"
              htmlFor="name"
            >
              Ваше имя
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-2.25 pl-3 text-sm outline-2 placeholder:text-gray-500"
                id="name"
                type="text"
                name="name"
                placeholder="Ваше имя"
                required
              />
            </div>
          </div>
        )}
        <div className="w-full pt-4">
          <div>
            <label
              className="py-2 block text-sm font-medium text-foreground"
              htmlFor="email"
            >
              Электронная почта
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-2.25 pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Введите ваш адрес электронной почты"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          <div className="pt-4">
            <label
              className="py-2 block text-sm font-medium text-foreground"
              htmlFor="password"
            >
              Пароль
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-2.25 pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Ваш пароль"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {isSignUp && (
            <div className="pt-4">
              <label
                className="py-2 block text-sm font-medium text-foreground"
                htmlFor="confirmPassword"
              >
                Подтверждение пароля
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-2.25 pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Повторите пароль"
                  required
                  minLength={6}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>
          )}
        </div>
				<div className="pt-8">
					<Button type="submit" className="w-full">
          	{isSignUp ? 'Зарегистрироваться' : 'Войти'}
          <ArrowRightIcon className="pl-auto h-5 w-5 text-gray-50" />
        </Button>
				</div>
        <div className="pt-3 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsSignUp((s) => !s)}
            className="text-green-600 hover:underline"
          >
            {isSignUp ? 'Назад на страницу входа' : 'Зарегистрироваться'}
          </button>
        </div>
        <div className="flex h-8 items-end space-x-1">
          {/* Add form errors here */}
        </div>
      </div>
    </form>
  );
}