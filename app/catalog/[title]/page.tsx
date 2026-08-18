
import ProductCard from "../../ui/productCard/ProductCard";
import { getProductCard } from "../../lib/actions";

interface PageProps {
  params: Promise<{ title: string }>; // Next.js params form
}

export default async function CatalogCards({ params }: PageProps) {
	 const { title } = await params;
	  const { res: products } = await getProductCard(title);
	//const params = await props.params;
  //const id = params.title;

	return (
<div>
	  {products.map((product, index) => (
    /* The loop index is safely accessible right here */
    <div 
      key={`${product.pathName}-${index}`} 
      className="flex w-full justify-center"
    >
      <ProductCard product={product} />
    </div>
  ))}
	{/* <ProductCard pathName={id}/> */}
</div>
	)
}

