
import ProductCard from "../../ui/productCard/ProductCard";
import { getRandomProducts } from "../../lib/actions";

export default async function MainPageCardsSection() {
  const { res: products } = await getRandomProducts(8);

  return (
    <section className="max-w-7xl mx-auto px-4 pb-16">      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          /* 2. Added the matching layout wrapper and compound key style used on your Catalog page */
          <div 
            key={`${product.pathName}-${index}`} 
            className="flex w-full justify-center"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

