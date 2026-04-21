import Image from "next/image";
import Link from "next/link";
import Heading from "../ui/Heading";
import Button from "../ui/Button";
import { ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { getDataForCropPage } from "../lib/actions";

export default async function CropsPage() {

	const sections = (await getDataForCropPage()).sections;

	return (
		<div className="w-full flex justify-center">
			<div className="w-full max-w-7xl min-w-xs flex flex-column justify-center">
				<div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
					<Heading level={2} className="text-3xl md:text-4xl font-bold text-center pb-4 lg:pb-8">Культуры</Heading>
					{sections.map((section, index) => {
						return(
							<div key={`${section.title}-${index}`} className="pb-8 lg:pb-12">
								<div className="flex justify-between flex-col sm:flex-row sm:items-center sm:gap-2">
									<Heading level={5} className="font-semibold pb-2 sm:pb-4">{section.title}</Heading>
									<Link href="" className="inline-flex items-center gap-2 text-foreground lowercase text-sm font-extrabold pb-3 sm:pb-0">
										<span className="underline underline-offset-3">Подробнее о культуре</span>
										<ChevronDoubleRightIcon className="h-5 w-5" />
									</Link>
									</div>
								<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
									{section.items.map((item, index) => (
										<li
											key={`${item.title}-${index}`}
											className="h-auto flex flex-col gap-2 sm:gap-4 justify-between bg-(--light-main)/50 rounded-lg border border-foreground/30 overflow-hidden"
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

												<div className="p-4">
													<span className="text-(--secondary) sm:text-lg font-extrabold uppercase">{item.title}</span>
												</div>

												<div className="text-foreground text-sm font-light flex flex-col gap-4 px-4">
													<div>
														<span className="font-semibold">Особенности сорта: </span>
														<span>{item.cropChars}</span>
													</div>
													<div>
														<span className="font-semibold">Описание головки: </span>
														<span>{item.cropChars}</span>
													</div>
												</div>
											</Link>

											<Link href={`/catalog/${item.id}`} className="p-4">
												<Button
													height={52}
													color="#064929"
													backgroundColor="#D3D34F"
													borderColor="#064929"
													className="w-full font-bold text-xl uppercase transition-all duration-200 hover:opacity-90 hover:shadow-md active:opacity-100"
													>Купить
												</Button>
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