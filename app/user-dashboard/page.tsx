import { lusitana } from '@/app/ui/fonts';

export default async function Page() {
   
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard ( Сделать здесь информацию о пользователе: имя фамилия номер телефона и почта)
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      </div>
      <h1> Должна быть кнопка изменения персональных данных и кнопка удалить аккаунт</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">   
      </div>
    </main>
  );
}