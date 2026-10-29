import type { ProductCard } from '@/app/lib/definitions';
import { searchProducts } from '@/app/lib/dbActions/productsDBactions';
import Heading from '@/app/ui/Heading';
import ProductCardUI from '@/app/ui/productCard/ProductCard';

interface SearchPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { search = '' } = await searchParams;
  const query = search.trim();
  const products: ProductCard[] = query ? await searchProducts(query) : [];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-12">
      <Heading level={2} className="pb-4 text-center text-3xl font-bold md:text-4xl lg:pb-8">
        {query ? `Результаты поиска: ${query}` : 'Поиск товаров'}
      </Heading>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 justify-items-center gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="flex w-full justify-center">
              <ProductCardUI product={product} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          {query ? 'По вашему запросу товары не найдены.' : 'Введите название товара в строку поиска.'}
        </p>
      )}
    </section>
  );
}
