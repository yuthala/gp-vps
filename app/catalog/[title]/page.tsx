
import ProductCard from "../../ui/productCard/ProductCard";;

export default async function CatalogCards(props: { params: Promise<{ title: string }> }) {
	const params = await props.params;
  const id = params.title;

	return (
<div>
	<ProductCard pathName={id}/>
</div>
	)
}

