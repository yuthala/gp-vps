// 'use client';

// import Link from 'next/link';
// import Heading from '@/app/ui/Heading';

// export const metadata = {
//   title: 'Страница не найдена | Green Pato',
// };

// export default function NotFoundPage() {
//   return (
//     <div className="min-h-screen bg-(--light-main) text-foreground">
//       <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
//         <div className="w-full max-w-5xl rounded-[32px] border border-[#064929]/10 bg-white shadow-[0_40px_120px_rgba(6,73,41,0.08)] p-8 sm:p-12">
//           <div className="text-center">
//             <span className="inline-flex rounded-full bg-[#40AD52]/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#40AD52]">
//               404 — не найдено
//             </span>
//             <Heading level={2} className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-5xl">
//               Извините, такой страницы нет
//             </Heading>
//             <p className="mx-auto mt-4 max-w-2xl text-base text-[#334155] md:text-lg">
//               Возможно, ссылка некорректна или страница была перемещена. Попробуйте вернуться на главную страницу.
//             </p>
//           </div>

//           <div className="mt-10 grid gap-4 sm:grid-cols-2">
//             <Link
//               href="/"
//               className="w-full rounded-xl bg-[#40AD52] px-6 py-4 text-center text-sm font-bold uppercase text-white transition hover:bg-[#32793b]"
//             >
//               На главную
//             </Link>
//             <Link
//               href="/catalog"
//               className="w-full rounded-xl border border-[#064929] bg-white px-6 py-4 text-center text-sm font-bold uppercase text-[#064929] transition hover:bg-[#F2F9ED]"
//             >
//               В каталог
//             </Link>
//           </div>

//           <div className="mt-10 rounded-3xl bg-[#F2F9ED] p-6 text-sm text-[#334155]">
//             <p className="font-semibold">Что можно сделать:</p>
//             <ul className="mt-3 list-disc space-y-2 pl-5">
//               <li>Проверьте адрес в адресной строке.</li>
//               <li>Попробуйте обновить страницу.</li>
//               <li>Вернитесь на главный экран и продолжите покупки.</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
    </main>
  );
}
