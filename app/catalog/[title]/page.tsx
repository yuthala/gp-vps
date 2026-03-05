export default async function CatalogCards(props: { params: Promise<{ title: string }> }) {
	 const params = await props.params;
  const id = params.title;
	console.log((await props.params).title)
	return (
<div>
	Here will be a page {id}
</div>
	)
}

