import Link from 'next/link';
import Image from 'next/image';
import { CardInfo } from '@/app/lib/definitions';
import cslx from 'clsx';

const cards: CardInfo[] = [
	{imageSrc: '/cropsSection/garlic.webp', imagePosition: 'left', heading: 'Чеснок', popularSorts: ['Любаша', 'Богатырь', 'Шадейка', 'Григорий Комаров'], generations: ['Зубок', 'Однозубок', 'Воздушные луковицы'], linkSort: '/crops', linkSortName: 'Смотреть все сорта', linkCrops: '/crops/sorts', linkCropsName: 'чеснок'},
	{imageSrc: '/cropsSection/onion.webp', imagePosition: 'right', heading: 'Лук', popularSorts: ['Ред Барон', 'Кармен', 'Стардаст', 'Ялтинский Красный', 'Геркулес'], generations: ['Семена (чернушка)', 'Севок'], linkSort: '/crops', linkSortName: 'Смотреть все сорта', linkCrops: '/crops/sorts', linkCropsName: 'лук'},
		{imageSrc: '/cropsSection/shalot.webp', imagePosition: 'left', heading: 'Шалот', popularSorts: ['Квочка', 'Сорокозубка', 'Розовый'], generations: ['Семена (чернушка)', 'Севок мелкий', 'Севок средний', 'Маточные луковицы'], linkSort: '/crops', linkSortName: 'Смотреть все сорта', linkCrops: '/crops/sorts', linkCropsName: 'шалот'}
]

export default function CropsCards() {
	return(
					<div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
						{cards.map((card, index) => {
							return (
								<div className={cslx("flex gap-4 md:gap-12 flex-col md:flex-row justify-center items-center md:items-start pb-8", index % 2 !== 0 ? "md:flex-row-reverse" : "")} key={index}>
									<Image
										src={card.imageSrc}
										width={500}
										height={515}
										alt={card.heading}
										className="rounded-sm w-full md:max-w-100 h-50 md:h-auto object-cover"
									/>
									<div className="w-full gap-4 md:flex md:flex-col md:max-w-140 grid grid-cols-1 sm:grid-cols-2">
										<div className="sm:col-span-2">
											<h5>{card.heading}</h5>
										</div>
										<div>
												<ul className="pt-2 pb-4 md:pb-0 text-foreground text-xl font-extrabold uppercase">Популярные сорта:
													{card.popularSorts.map((sort: string, index: number) => (
														<li 
															key={`${card.heading}-${index}`}
															className="text-lg capitalize font-light list-inside list-disc leading-1.2"
														>
														{sort}</li>
													))}
												</ul>
												<Link href={card.linkSort ?? '/catalog'} className="text-(--secondary) text-lg font-bold">{card.linkSortName}  →</Link>
										</div>

										<div>
											<ul className="pt-2 pb-4 md:pb-0 sm:pl-4 md:pl-0 text-foreground text-xl font-extrabold uppercase">Генерации:
												{card.generations?.map((generation: string, index: number) => (
													<li 
														key={`${card.heading}-gen-${index}`} 
														className="text-lg capitalize font-light list-inside list-disc leading-1.2"
														>{generation}
													</li>
												))}
											</ul>
											<Link href={card.linkCrops ?? '/catalog'} className="text-(--secondary) text-lg font-bold">Смотреть {card.linkCropsName}  →</Link>
										</div>
									</div>
								</div>
							)
						})
				}
			</div>
	)
}