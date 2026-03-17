import { useState, useEffect } from 'react';
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
	console.log('selected', selected)

  return (
    <section className="mt-8">
      <h5>Вам может понравиться</h5>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {selected.map((product, index) => (
          <MiniProductCardComponent key={index} imageSrc={product.imageSrc} shortDescription={product.description} price={product.price || 0} />
        ))}
      </div>
    </section>
  );
}