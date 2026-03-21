import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MiniProductCard } from '../../lib/definitions';
import MiniProductCardComponent from '@/app/ui/recommendedProducts/MiniProductCardComponent';
import {getProductCard, getRecommendedProducts} from '@/app/lib/actions';

export default function RecommendedProducts() {
	const [data, setData] = useState<MiniProductCard[]>()

	useEffect(() => {
		const handleAction = async () => {
		const array = (await getProductCard('')).products;
		const result = await getRecommendedProducts(array);
		setData(result);
	}
		handleAction();
	}, [])

  // Randomly select 3 products
  const shuffled = [...(data || [])].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  return (
    <section className="pt-10 sm:pt-20">
			<div className="flex items-center gap-4 pb-6 sm:pb-10">
				<h5>Вам может понравиться</h5>
					<Image
						src='/recommendedProducts/heart-icon.svg'
						width={75}
						height={57}
						alt='heart-icon'
						className="object-cover"
					/>
			</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selected.map((product, index) => (
					<MiniProductCardComponent 
						key={index}
						imageSrc={product.imageSrc} 
						shortDescription={product.description} 
						price={product.price || 0}
						pathName={product.pathName}
						cropName={product.cropName}
						 />
        ))}
      </div>
    </section>
  );
}