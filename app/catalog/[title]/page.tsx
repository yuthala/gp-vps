
import { ProductCard } from "@/app/lib/definitions";
import ProductCardUI from "../../ui/productCard/ProductCard";
//import { getProductCard } from "../../lib/actions";
import { fetchProductsByPathNameTitle } from '@/app/lib/dbActions/productsDBactions'

interface PageProps {
  params: Promise<{ title: string }>; // Next.js params form
}

export default async function CatalogCards({ params }: PageProps) {
	const { title } = await params;
	//const { res: products } = await getProductCard(title);
	const products: ProductCard[]  = await fetchProductsByPathNameTitle(title)

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
				{products.map((product, index) => (
				/* The loop index is safely accessible right here */
				<div 
					key={`${product.pathName}-${index}`} 
					className="flex w-full justify-center"
				>
					<ProductCardUI product={product} />
				</div>
			))}
			{/* <ProductCard pathName={id}/> */}
		</div>
	)
}

