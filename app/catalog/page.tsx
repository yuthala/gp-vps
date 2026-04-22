import Image from "next/image";
import Link from "next/link";
import Heading from "../ui/Heading";
import { getDataForCatalogPage } from "../lib/actions";
import { getProductCard } from "../lib/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Catalog({ params }: PageProps) {

	// const sections = (await getDataForCatalogPage()).sections;
	const { sections } = await getDataForCatalogPage();
	const { id } = await params;

	return (
		<div className="w-full flex justify-center">
			<div className="w-full max-w-7xl min-w-xs flex flex-column justify-center">
				<div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
					<Heading level={2} className="text-3xl md:text-4xl font-bold text-center pb-4 lg:pb-8">Каталог</Heading>
					{sections.map((section, index) => {
						return(
							<div key={`${section.title}-${index}`} className="pb-8 lg:pb-12">
								<Heading level={5} className="font-semibold pb-4">{section.title}</Heading>
								<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
									{section.items.map((item, index) => (
										<li
											key={`${item.title}-${index}`}
											className="bg-(--accent) rounded-lg overflow-hidden transition-transform hover:scale-[1.02] duration-200"
										>
											<Link href={`/catalog/${item.id}`} className="block">
												<div className="relative w-full" style={{ paddingBottom: '50%' }}> {/* 360x180 aspect ratio (2:1) */}
													<Image
														src={item.imageSrc}
														width={360}
														height={180}
														alt={item.title}
														className="absolute inset-0 w-full h-full object-cover"
													/>
												</div>
												<div className="p-4 h-18 flex items-center justify-center">
													<Heading level={6} className="uppercase text-center">{item.title}</Heading>
												</div>
											</Link>
										</li>
									))}
								</ul>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}