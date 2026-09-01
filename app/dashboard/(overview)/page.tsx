
import { lusitana } from '@/app/ui/fonts';

export default async function HomeDashboardPage() {
   
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Стартовая страница dashboard, здесь будет отображаться информация о последних заказах, продажах и т.д.
      </h1>
    </main>
  );
}