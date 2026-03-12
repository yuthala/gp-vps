'use client';

import { useSearchParams } from 'next/navigation';
import { ProductCard } from '../../lib/definitions';
import PackageSelectorWithUrl from "@/app/ui/productCard/PackageSelector";
import AdditionalInfoProduct from "../../ui/productCard/AdditionalInfoProduct";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import Pricing from "../../ui/Pricing";
import Counter from "../counter/Counter";
import TagList from '../TagList';

export default function ProductDetails({ data }: { data: ProductCard}) {
	const searchParams = useSearchParams();
	const index = searchParams.get('package');
  const packageSize = data.packageSize.filter(packageSize => packageSize > 0)[Number(index)];

	const qty = searchParams.get('qty');

	return(
		<div className="lg:w-1/2 p-8 flex flex-col">
		<Heading level={5} className="capital">
			{data.description}
		</Heading>
		{/* Блок выбора размера упаковки */}
		<PackageSelectorWithUrl packaging={data}/>

		{/* Теги */}
		<div  className=" py-4 sm:py-6" >
			<TagList tags={data.tags || []}/>
		</div>

		{/* Product features/additional info */}
		<AdditionalInfoProduct data={data}/>

		{/* Цена и стоимость */}
		<div className="flex gap-2">
			<Pricing
				className="text-2xl lg:text-3xl text-[#40AD52] font-bold"
				value={data.price * packageSize} 
				prefix="Цена:" 
				>
			</Pricing>
		</div>

		<div className="text-lg font-light text-[#40AD52]  pb-4 sm:pb-8">за упаковку {data.measureUnit * packageSize} г</div>

		<div className="flex gap-2 pb-8 sm:pb-12">
			<Pricing
				className="text-xl lg:text-2xl text-[#064929] font-semibold"
				value={data.price * packageSize * (Number(qty) || 1)}
				prefix="Стоимость:" 
				>
			</Pricing>
		</div>
		
		{/* Кнопка Заказать и Counter */}
		<div className="flex flex-col sm:flex-row items-center gap-4">
			<Button backgroundColor="#40AD52" color="text-white" className="text-2xl uppercase font-extrabold px-16">
				В корзину
			</Button>
			<Counter 
			className="w-55 justify-evenly"
				initialValue={Number(qty) || 1}
				min={1}
				max={10}
			/>
		</div>
	</div>
	)
}