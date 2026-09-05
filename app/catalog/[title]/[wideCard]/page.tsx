
//import { getProductCard } from "../../../lib/actions";
import ProductImage from "@/app/ui/productCard/ProductImage";
import ProductDetails from '../../../ui/productCard/ProductDetails';
import { fetchProductsByPathAndCropName } from "@/app/lib/dbActions/productsDBactions";


export default async function WideCardPage(props: { params: Promise<{ title: string, wideCard: string }> }) {
	const {title, wideCard} = await props.params;
	//const data = (await getProductCard(title, wideCard)).data;
  const data = await fetchProductsByPathAndCropName(title, wideCard)

	return (
  <div className="min-h-screen flex p-4 pt-20 justify-center">
    <div className="max-w-7xl w-full">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Image gallery with its own background */}
          <div className="lg:w-1/2 p-8 flex items-center justify-center">
            <ProductImage data={data}/>
          </div>

          {/* Right side - Product details */}
					<ProductDetails data={data}/>
        </div>
      </div>
    </div>
  </div>
)
}