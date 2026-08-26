/* eslint-disable @next/next/no-html-link-for-pages */
'use client'; 

import Heading from '@/app/ui/Heading';

export default function ErrorPage({ 
  error, 
  //reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void; 
}) {
  return (
    <div className="min-h-screen bg-(--light-main) text-foreground">
      <title>Ошибка сервера | Green Pato</title>
      
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

          <div className="mt-10 flex justify-center">
            {/* <button
              type="button"
              onClick={reset}
              className="w-full rounded-xl bg-[#40AD52] px-6 py-4 text-sm font-bold uppercase text-white transition hover:bg-[#32793b] focus:outline-none focus:ring-2 focus:ring-[#40AD52]/40"
            >
              Повторить попытку
            </button> */}
            
            {/* Использование тега <a> вместо <Link> решает проблему с зависанием навигации 
            Если приложение падает из-за перехода на неисправную страницу, то приложение падает и Link не работает
            */}
     
            <a
              href="/"
              className="w-full max-w-xs rounded-xl border border-[#064929] bg-white px-6 py-4 text-center text-sm font-bold uppercase text-[#064929] transition hover:bg-[#F2F9ED]"
            >
              На главную
            </a>
          </div>

          <div className="mt-10 rounded-3xl bg-[#F2F9ED] p-6 text-sm text-[#334155]">
            <p className="font-semibold">Подробности ошибки:</p>
            <p className="mt-2 break-words font-mono text-xs bg-white/50 p-3 rounded-lg border border-[#064929]/5">
              {error?.message || 'Неизвестная ошибка'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}


