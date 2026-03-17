import { getProductCard } from "../../lib/actions";
import clsx from 'clsx';
import  OnStock  from "./status";
import Image from "next/image";
import Button from "../Button";
import Link from "next/link";
import Pricing from "../Pricing";


export default async function ProductCard({ pathName}: { pathName: string}) {
	
	const products = (await getProductCard(pathName)).res;

	return (
  <div className="w-full flex justify-center">
    <div className="w-full max-w-7xl min-w-xs flex flex-col justify-center">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
          {products.map((product, index) => {
            return (
              <div key={`${product.pathName}-${index}`} className="flex w-full justify-center">
                {/* Product Card - with equal height */}
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 w-full max-w-90 flex flex-col h-full border border-[#064929]/20">
                  {/* Image - fixed dimensions 360x230 */}
                  <div className="w-full h-57.5 overflow-hidden shrink-0">
                    <Image
                      src={product.imageSrc[0]}
                      width={360}
                      height={230}
                      alt={product.pathName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Card Content - flex-grow to fill remaining space */}
                  <div className="p-4 flex flex-col grow">
                    {/* Short Description */}
                    <h6 className="h-22.5 mb-3 line-clamp-3 shrink-0">
                      {product.description || 'Здесь должно быть описание товара'}
                    </h6>

										<OnStock onStockStatus={product.onStockStatus}/>
                    
                    {/* Spacer to push content down if needed */}
                    <div className="grow"></div>

										<div className={clsx(
											'pb-8',
											product.onStockStatus === 'available' ? 'text-[#40AD52]' : 'text-gray-400'
										)}>
											<div className="flex justify-between">
												<Pricing
													containerClassName="text-2xl font-semibold"
													value={product.price} 
													prefix="Цена:" 
												>
												</Pricing>
											</div>
											<div className="text-xl font-light">за {product.measureUnit} г</div>
										</div>
                    
                    {/* Button */}
										<Link href={`/catalog/${product.pathName}/${product.cropName}`} passHref>
											<Button 
												className={clsx(
													"w-full py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shrink-0 uppercase",
													{
														'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400': product.onStockStatus !== 'available',
														'bg-[--accent] hover:scale-[1.02] text-[--foreground] focus:ring-lime-500': product.onStockStatus === 'available'
													}
												)}
												disabled={product.onStockStatus !== 'available'}
											>
												<span className="text--foreground font-extrabold">
													{product.onStockStatus !== 'available' ? 'Нет в наличии' : 'Купить'}
												</span>
											</Button>
										</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);
}