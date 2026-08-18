'use client';

import Link from 'next/link';
import Heading from '@/app/ui/Heading';

export const metadata = {
  title: 'Ошибка сервера | Green Pato',
};

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }): import("react").JSX.Element {
  return (
    <div className="min-h-screen bg-(--light-main) text-foreground">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl rounded-4xl border border-[#064929]/10 bg-white shadow-[0_40px_120px_rgba(6,73,41,0.08)] p-8 sm:p-12">
          <div className="text-center">
            <span className="inline-flex rounded-full bg-[#40AD52]/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#40AD52]">
              Сервер недоступен
            </span>
            <Heading level={2} className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              Упс! Что-то пошло не так
            </Heading>
            <p className="mx-auto mt-4 max-w-2xl text-base text-[#334155] md:text-lg">
              Возможно, сервер временно недоступен или возникли проблемы с интернет-соединением. Попробуйте повторить попытку или вернуться на главную страницу.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl bg-[#40AD52] px-6 py-4 text-sm font-bold uppercase text-white transition hover:bg-[#32793b] focus:outline-none focus:ring-2 focus:ring-[#40AD52]/40"
            >
              Повторить попытку
            </button>
            <Link
              href="/"
              className="w-full rounded-xl border border-[#064929] bg-white px-6 py-4 text-center text-sm font-bold uppercase text-[#064929] transition hover:bg-[#F2F9ED]"
            >
              На главную
            </Link>
          </div>

          <div className="mt-10 rounded-3xl bg-[#F2F9ED] p-6 text-sm text-[#334155]">
            <p className="font-semibold">Подробности ошибки:</p>
            <p className="mt-2 wrap-break-word">{error?.message || 'Неизвестная ошибка'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
