import { ProductCard } from "../../lib/definitions";

export default function AdditionalInfoProduct({ data }: { data: ProductCard }) {
	return(
		<div className="flex flex-col gap-2 w-full py-4 sm:py-8">
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
	)
}