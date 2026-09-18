import ProductCard from "../../ui/productCard/ProductCard";
import { getProductCard } from "../../lib/actions";

export default async function CatalogCardsCrops(props: { params: Promise<{ title: string }> }) {
	const params = await props.params;
	const id = params.title;
	const { data } = await getProductCard(id);

	if (!data) {
		return <div>Товар не найден</div>;
	}

	return (
		<div>
			<ProductCard product={data} />
		</div>
	)
}