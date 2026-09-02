// 'use client';

// import { useSearchParams } from 'next/navigation';
// import { Suspense } from 'react';
// import Link from 'next/link';

// export default function VerifyPage() {
 
//   const searchParams = useSearchParams();
//   const status = searchParams.get('status')
        
//   return (
//     <Suspense fallback={<div>Загрузка страницы...</div>}>
//           return (
//     <div style={styles.container}>
//       <div style={styles.card}>
        
//         {/* 1. СОСТОЯНИЕ ЗАГРУЗКИ */}
//         {status === 'loading' && (
//           <>
//             <h2 style={styles.title}>⏳ Проверка ссылки...</h2>
//             <p style={styles.text}>Пожалуйста, подождите, мы проверяем ваши данные.</p>
//           </>
//         )}

//         {/* 2. УСПЕШНОЕ ПОДТВЕРЖДЕНИЕ */}
//         {status === 'success' && (
//           <>
//             <h2 style={{ ...styles.title, color: '#2e7d32' }}>✅ Почта подтверждена!</h2>
//             <p style={styles.text}>Ваш аккаунт успешно активирован. Теперь вы можете войти.</p>
//             <Link href="/login" style={styles.buttonPrimary}>Войти в аккаунт</Link>
//           </>
//         )}

//         {/* 3. ОБРАБОТКА ПОВТОРНОГО ИСПОЛЬЗОВАНИЯ ИЛИ СТАРОЙ ССЫЛКИ */}
//         {status === 'expired' && (
//           <>
//             <h2 style={{ ...styles.title, color: '#d32f2f' }}>⚠️ Ссылка недействительна</h2>
//             <p style={styles.text}>
//               Эта ссылка уже была использована для подтверждения или её срок действия истек.
//             </p>
//             <p style={styles.subtext}>
//               Возможно, вы уже активировали аккаунт ранее. Попробуйте войти.
//             </p>
//             <div style={styles.buttonGroup}>
//               <Link href="/login" style={styles.buttonPrimary}>Перейти ко входу</Link>
//               <Link href="/resend-verification" style={styles.buttonSecondary}>Запросить новую ссылку</Link>
//             </div>
//           </>
//         )}

//         {/* 4. СИСТЕМНАЯ ОШИБКА */}
//         {status === 'error' && (
//           <>
//             <h2 style={{ ...styles.title, color: '#c62828' }}>❌ Ошибка запроса</h2>
//             <p style={styles.text}>Не удалось проверить ссылку. Убедитесь, что адрес указан верно.</p>
//             <Link href="/" style={styles.buttonSecondary}>На главную</Link>
//           </>
//         )}

//       </div>
//     </div>
//   );
//       {/* <VerifyContent /> */}
//     </Suspense>
//   );
// }

// // Минималистичные стили для наглядности (можно заменить на Tailwind / CSS Modules)
// const styles = {
//   container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'sans-serif' },
//   card: { padding: '40px', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%', textAlign: 'center' as const },
//   title: { fontSize: '24px', marginBottom: '16px', fontWeight: '600' },
//   text: { fontSize: '16px', color: '#555', marginBottom: '20px', lineHeight: '1.5' },
//   subtext: { fontSize: '14px', color: '#888', marginBottom: '24px' },
//   buttonGroup: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
//   buttonPrimary: { display: 'block', padding: '12px', backgroundColor: '#0070f3', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' },
//   buttonSecondary: { display: 'block', padding: '12px', backgroundColor: '#eaeaea', color: '#333', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' },
// };

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  // Общие стили для контейнера карточки
  const cardStyles = "w-full max-w-md transform rounded-3xl bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl border border-gray-100/80 text-center transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-[fadeIn_0.4s_ease-out]";

  // 1. СОСТОЯНИЕ УСПЕШНОЙ ВЕРИФИКАЦИИ
  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50/40 via-gray-50 to-gray-100/50 px-4">
        <div className={cardStyles}>
          {/* Иконка Успеха */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 ring-4 ring-emerald-50/50 animate-bounce [animation-iteration-count:1] [animation-duration:1s]">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="mt-8 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Почта подтверждена!
          </h2>
          <p className="mt-3 text-base text-gray-500 leading-relaxed px-2">
            Ваш аккаунт успешно активирован. Все функции платформы теперь доступны.
          </p>
          
          <div className="mt-8">
            <Link 
              href="/login" 
              className="flex w-full justify-center rounded-2xl bg-gray-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-gray-900/20 active:scale-[0.98] transition-all duration-200"
            >
              Войти в личный кабинет
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. СОСТОЯНИЕ ОШИБКИ: ТОКЕН ИСТЕК ИЛИ НЕВАЛИДЕН
  if (status === 'expired' || status === 'missing_token') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-50/30 via-gray-50 to-gray-100/50 px-4">
        <div className={cardStyles}>
          {/* Иконка Ошибки */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 ring-4 ring-rose-50/50 animate-[shake_0.5s_ease-in-out]">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          
          <h2 className="mt-8 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Ссылка устарела
          </h2>
          <p className="mt-3 text-base text-gray-500 leading-relaxed px-2">
            {status === 'missing_token' 
              ? 'Токен верификации не найден в запросе.' 
              : 'Срок действия этой ссылки истёк, либо аккаунт уже был подтвержден.'}
          </p>
          
          {/* Мягкая подсказка (Инфоблок) */}
          <div className="mt-6 rounded-2xl bg-amber-50/60 p-4 border border-amber-100/70 text-left backdrop-blur-sm">
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Безопасность прежде всего</h4>
                <p className="mt-1 text-xs text-amber-800/90 leading-relaxed">
                  Ссылки подтверждения активны короткое время. Вы можете мгновенно запросить новую.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link 
              href="/auth/resend-verification" 
              className="flex w-full justify-center rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/10 hover:bg-blue-500 hover:shadow-blue-600/20 active:scale-[0.98] transition-all duration-200"
            >
              Получить новую ссылку
            </Link>
            <Link 
              href="/login" 
              className="flex w-full justify-center rounded-2xl bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98] transition-all duration-200"
            >
              На страницу входа
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. СОСТОЯНИЕ КРИТИЧЕСКОЙ ОШИБКИ СЕРВЕРА
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100 via-gray-50 to-gray-200/50 px-4">
      <div className={cardStyles}>
        {/* Иконка Предупреждения */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 ring-4 ring-gray-100/50">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="mt-8 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Ошибка сервера
        </h2>
        <p className="mt-3 text-base text-gray-500 leading-relaxed px-2">
          Не удалось связаться с базой данных. Сервис временно недоступен, мы уже чиним его.
        </p>
        
        <div className="mt-8">
          <Link 
            href="/" 
            className="flex w-full justify-center rounded-2xl bg-gray-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-gray-900/10 hover:bg-gray-800 hover:shadow-gray-900/20 active:scale-[0.98] transition-all duration-200"
          >
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}
