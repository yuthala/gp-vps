
// import ProductCard from "../../ui/productCard/ProductCard";
// import { getRandomProducts } from "../../lib/actions";

// export default async function MainPageCardsSection() {
//   const { res: products } = await getRandomProducts(8);

//   return (
//     <section className="max-w-7xl mx-auto px-4 pb-16">      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {products.map((product, index) => (
//           /* 2. Added the matching layout wrapper and compound key style used on your Catalog page */
//           <div 
//             key={`${product.pathName}-${index}`} 
//             className="flex w-full justify-center"
//           >
//             <ProductCard product={product} />
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }
import { Suspense } from 'react';
import ProductCard from "../../ui/productCard/ProductCard";
import { fetchRandomProducts } from "../../lib/dbActions/productsDBactions"; // Импортируем вашу новую функцию

// 1. Внутренний компонент, который отвечает ТОЛЬКО за фоновую загрузку данных
async function RandomProductsList() {
  // Получаем массив напрямую из вашей новой функции fetchRandomProducts
  //const products = await fetchRandomProducts();

  console.log('🔄 1. Фоновый компонент RandomProductsList начал работу');
  
  const products = await fetchRandomProducts();

  console.log('📦 2. Ответ от fetchRandomProducts:', products);

  // if (!products) {
  //   console.error('❌ Ошибка: fetchRandomProducts вернул undefined или null!');
  //   return <div className="text-red-500 p-4 border border-red-500">Ошибка: Данные не получены</div>;
  // }

  // if (products.length === 0) {
  //   console.warn('⚠️ Предупреждение: База данных вернула пустой массив []. Товаров со статусом available нет!');
  //   return <div className="text-gray-500 p-4">В базе данных нет подходящих товаров</div>;
  // }

  console.log(`✅ 3. Рендерим сетку из ${products.length} товаров`);

  if (!products || products.length === 0) {
    return null; // Если товаров почему-то нет, ничего не рендерим
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div 
          key={`${product.pathName}-${index}`} 
          className="flex w-full justify-center"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

// 2. Основной компонент секции (Экспортируется на главную страницу)
export default function MainPageCardsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 pb-16">      
      {/* 
        Suspense позволяет странице загрузиться мгновенно.
        fallback={null} означает: пока товары грузятся из БД, на этом месте абсолютно пусто.
        Как только RandomProductsList получит данные, сетка товаров плавно появится на экране.
      */}
      <Suspense fallback={null}>
        <RandomProductsList />
      </Suspense>
    </section>
  );
}


