import React from 'react';
import Link from 'next/link';

export default function Forbidden() {
  return (
    /* 
      1. Задан z-0 и pt-20 для корректного отображения под фиксированным Header.
      2. Применен общий светлый градиент фона bg-gradient-to-b от #F2F9ED до #FFFFFF.
    */
    <main className="relative z-0 min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#F2F9ED] to-[#FFFFFF] text-[#064929] font-sans select-none px-4 pt-20 pb-10">
      
      {/* Белая карточка с рамкой и тенью из вашего общего дизайна */}
      <div className="relative z-10 w-full max-w-[680px] p-6 md:p-8 bg-white border border-[#064929]/12 rounded-[30px] shadow-[0_32px_80px_rgba(6,73,41,0.08)] text-left">
        
        {/* Верхний лейбл-индикатор */}
        <div className="inline-flex items-center gap-2.5 text-[0.85rem] font-bold tracking-[0.18em] uppercase text-[#40AD52] mb-6">
          <span className="w-3 h-3 rounded-full bg-[#40AD52]" />
          Доступ запрещён
        </div>

        {/* Код ошибки и анимированная иконка в одном блоке (опционально, для акцента) */}
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#064929] leading-none">
            403
          </h1>
          {/* Иконка замка в вашей новой цветовой палитре */}
          <div className="w-12 h-12 text-[#40AD52]">
            <svg className="w-full h-full fill-current" viewBox="0 0 24 24" xmlns="http://w3.org">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
        </div>

        {/* Главный заголовок */}
        <p className="text-2xl md:text-4xl font-bold tracking-tight text-[#064929] line-clamp-2 leading-[1.1] mb-6">
          Эта страница доступна только для авторизованных пользователей.
        </p>

        {/* Описание проблемы */}
        <p className="text-base md:text-lg text-[#334155] leading-relaxed mb-8">
          Пожалуйста, войдите в систему с разрешённым аккаунтом. Если вы считаете, что это ошибка, обратитесь к администратору.
        </p>
        
        {/* Кнопка возврата с тенью и плавной анимацией при ховере */}
        <Link 
          href="/" 
          className="inline-flex items-center justify-center px-6 py-3.5 bg-[#40AD52] text-white font-bold text-base rounded-full transition-all duration-150 shadow-[0_18px_30px_rgba(64,173,82,0.24)] hover:-translate-y-0.5 hover:shadow-[0_22px_34px_rgba(64,173,82,0.28)]"
        >
          Вернуться на главную
        </Link>
      </div>
    </main>
  );
}



