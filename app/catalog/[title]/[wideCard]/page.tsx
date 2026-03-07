
import { getProductCard } from "../../../lib/actions";
import ProductImage from "@/app/ui/productCard/ProductImage";
import PackageItem from "@/app/ui/productCard/PackageItem";
import Button from "../../../ui/Button";
import clsx from 'clsx';

export default async function WideCardPage(props: { params: Promise<{ title: string, wideCard: string }> }) {
	const {title, wideCard} = await props.params;

	const data = (await getProductCard(title, wideCard)).data;
		console.log(data);

	return (
  <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
    <div className="max-w-7xl w-full">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left side - Image gallery with its own background */}
          <div className="lg:w-1/2 p-8 flex items-center justify-center">
            <ProductImage data={data}/>
          </div>

          {/* Right side - Product details */}
          <div className="lg:w-1/2 p-8 flex flex-col">
            <h5 className="capital">{data.description}</h5>
						{/* Блок выбора размера упаковки */}
						<PackageItem packaging={data}/>

            {/* Product features/additional info */}
						<div className="flex flex-col gap-2 w-full pt-4 sm:pt-8">
							<div className="flex items-center">
								<span className="whitespace-nowrap pb-3 pr-2 text-sm sm:text-lg font-semibold">Фракция</span>
								<div className="flex-1 border-b-2 border-dotted border-gray-800 mx-2"></div>
								<span className="whitespace-nowrap pb-3 pl-2 text-sm sm:text-lg font-semibold">{data.cropSize}</span>
							</div>

							<div className="flex items-center">
								<span className="whitespace-nowrap pb-3 pr-2 text-sm sm:text-lg font-semibold">Наличие</span>
								<div className="flex-1 border-b-2 border-dotted border-gray-800 mx-2"></div>
								<span 
									className={`
										whitespace-nowrap pb-3 pl-2 text-sm sm:text-lg font-extrabold uppercase
										${data.onStockStatus === 'available' 
											? 'text-[#40AD52]' 
											: data.onStockStatus === 'not_available' 
												? 'text-red-500' 
												: 'text-orange-500'
										}
									`}
								>
									{data.onStockStatus === 'available' 
										? 'в наличии' 
										: data.onStockStatus === 'not_available' 
											? 'нет в наличии' 
											: 'по предзаказу'
									}
								</span>
							</div>

							{data.onStockStatus === 'expected' && 
							  <div className="flex items-center">
									<span className="whitespace-nowrap pb-3 pr-2 text-xs xs:text-sm sm:text-lg font-semibold">Ожидаемый срок поставки</span>
									<div className="flex-1 border-b-2 border-dotted border-gray-800 mx-2"></div>
									<span className="whitespace-nowrap pb-3 pl-2 text-xs xs:text-sm sm:text-lg font-semibold">{data.estimatedOnStockDate}</span>
								</div>
							}
						</div>

						<div className="flex justify-between pt-8 sm:pt-12">
							<span className="text-2xl text-[#40AD52] font-semibold">Цена:</span>
							<span className="text-2xl text-[#40AD52] font-semibold">{data.price * data.measureUnit} р.</span>
						</div>
            
            <Button>
              В корзину
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
)
}