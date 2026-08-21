'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error }: ErrorProps) {
  useEffect(() => {
    console.error('Ошибка загрузки каталога:', error);
  }, [error]);

  const isNetworkOrDbError = 
    error.message?.toLowerCase().includes('fetch') || 
    error.message?.toLowerCase().includes('database') || 
    error.message?.toLowerCase().includes('connect') ||
    error.message?.toLowerCase().includes('failed');

  return (
    // Добавлен z-0, чтобы весь контейнер ошибки не спорил с глобальным Header
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-b from-slate-400 via-slate-300 to-zinc-400 rounded-2xl border border-slate-400 shadow-2xl z-0">
      
      {/* СЛОЙ 1: ПЛЫВУЩИЕ СЕРЫЕ ДОЖДЕВЫЕ ОБЛАКА */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Задний план — темное грозовое небо */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-500/30 to-transparent" />

        {/* Облако 1: Большое, тяжелое, медленное */}
        <div className="absolute top-4 left-0 w-64 h-16 bg-slate-500/50 rounded-full blur-md animate-cloud-slow 
          before:content-[''] before:absolute before:-top-6 before:left-10 before:w-24 before:h-24 before:bg-slate-500/50 before:rounded-full 
          after:content-[''] after:absolute after:-top-4 after:right-10 after:w-28 after:h-28 after:bg-slate-500/50 after:rounded-full" 
        />

        {/* Облако 2: Среднее, чуть ниже и быстрее */}
        <div 
          className="absolute top-14 left-1/4 w-48 h-12 bg-slate-600/40 rounded-full blur-sm animate-cloud-fast before:content-[''] before:absolute before:-top-4 before:left-8 before:w-16 before:h-16 before:bg-slate-600/40 before:rounded-full" 
          style={{ animationDelay: '-10s' }}
        />

        {/* Облако 3: Низкое темное облако */}
        <div className="absolute top-8 right-0 w-56 h-14 bg-slate-700/30 rounded-full blur-lg animate-cloud-slow" style={{ animationDelay: '-22s' }} />
      </div>

      {/* СЛОЙ 2: ИДУЩИЙ СТЕНАМИ ДОЖДЬ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-70">
        {/* Левая часть экрана */}
        <div className="absolute top-0 left-[15%] w-[1px] h-12 bg-slate-200 animate-rain-layer-1" />
        <div className="absolute top-10 left-[25%] w-[1px] h-16 bg-slate-300 animate-rain-layer-2" />
        <div className="absolute top-0 left-[35%] w-[1px] h-10 bg-slate-100 animate-rain-layer-3" />
        
        {/* Центр экрана */}
        <div className="absolute top-5 left-[50%] w-[1px] h-14 bg-slate-200 animate-rain-layer-2" />
        <div className="absolute top-0 left-[60%] w-[1px] h-16 bg-slate-300 animate-rain-layer-1" />
        
        {/* Правая часть экрана */}
        <div className="absolute top-15 left-[75%] w-[1px] h-12 bg-slate-100 animate-rain-layer-3" />
        <div className="absolute top-0 left-[85%] w-[1px] h-14 bg-slate-200 animate-rain-layer-1" />
        <div className="absolute top-5 left-[95%] w-[1px] h-16 bg-slate-300 animate-rain-layer-2" />
      </div>

      {/* СЛОЙ 3: ИНФОРМАЦИОННОЕ ОКНО (Понижено с z-20 до z-10) */}
      <div className="z-10 text-center max-w-sm bg-slate-900/20 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Иконка непогоды */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/40 text-slate-100 shadow-inner">
          <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5M12 19.5V21M4.22 4.22l1.06 1.06M17.657 17.657l1.06 1.06M3 12h1.5M19.5 12H21M4.22 19.78l1.06-1.06M17.657 6.343l1.06-1.06M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" style={{ opacity: 0.15 }} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
        </div>

        <div className="space-y-2">
          <p className="text-xl font-bold text-slate-900 drop-shadow-sm">
            {isNetworkOrDbError ? 'Соединение размыло дождем' : 'Что-то пошло не так'}
          </p>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {isNetworkOrDbError 
              ? 'Не удалось установить связь с базой данных или сервером. Пожалуйста, проверьте ваше интернет-подключение.'
              : 'Произошла ошибка при загрузке каталога. Мы уже исправляем неполадки в системе.'}
          </p>
        </div>

        {/* Единственная кнопка обновления */}
        <div>
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-800/90 active:bg-slate-900 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
          >
            Обновить страницу
          </button>
        </div>
      </div>

      {/* СЛОЙ 4: КАЧАЮЩИЕСЯ ОТ ВЕТРА ДЕРЕВЬЯ */}
      <div className="absolute bottom-0 inset-x-0 h-28 flex items-end justify-between px-4 pointer-events-none z-0 select-none opacity-60">
        {/* Левый лес */}
        <div className="flex items-end gap-0.5 origin-bottom animate-forest-wind">
          <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[45px] border-b-slate-700" />
          <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[75px] border-b-slate-800 -ml-5 relative z-[1]" />
          <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[55px] border-b-slate-600 -ml-4" />
        </div>

        {/* Правый лес */}
        <div className="flex items-end gap-0.5 origin-bottom animate-forest-wind" style={{ animationDelay: '1.2s' }}>
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[85px] border-b-slate-700" />
          <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[60px] border-b-slate-600 -ml-6" />
        </div>
      </div>
    </div>
  );
}
