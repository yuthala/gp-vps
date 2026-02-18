import Link from "next/link";
import Image from "next/image";

export default function OurOzonShop() {
	return (
		<section className="w-full pb-8 md:pb-16">
			<div className="max-w-7xl mx-auto px-4 md:px-8">
				<div className="flex flex-col md:flex-row items-center justify-center gap-4 pb-8 lg:pb-12">
					<h2 className="text-3xl md:text-4xl font-bold text-center">Наш магазин на</h2>
					<Image
						src='/ozonShop/ozon-logo.png'
						width={186}
						height={50}
						alt='ozon logo'
					/>
				</div>

				<div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 lg:gap-8 pb-4 sm:pb-8 lg:pb-12">
					<div className="flex flex-col items-center gap-8 lg:max-w-[40%]">
						<div className="text-base md:text-lg font-light text-foreground">
							<p className="pb-2">Купить нашу продукцию можно также на маркетплейсе Озон. В нашем магазине на Озон представлены некоторые, наиболее популярные,  позиции из нашего ассортимента.</p>
							<p className="pb-2">Перед оформлением заказа проверьте, что вы совершаете покупку в оригинальном магазине Green Pato.</p>
						</div>
						<Image
							src='/ozonShop/ozon-square-logo.png'
							width={221}
							height={214}
							alt='ozon logo'
							className="max-w-30 md:max-w-40 lg:max-w-47.5 xl:max-w-55.25 h-auto"
						/>
					</div>

					<Image
						src='/ozonShop/ozon-shop.png'
						width={637}
						height={472}
						alt='shop info'
						className="max-w-75 sm:max-w-100 md:max-w-125 lg:max-w-150 h-auto"
					/>
				</div>


				<div className="flex justify-center">
					<Link href="https://www.ozon.ru/seller/green-pato/" target="_blank" rel="noopener noreferrer" className="relative bg-(--accent) px-8 sm:px-16 md:px-24 py-3 md:py-4 text-foreground text-xl sm:text-2xl md:text-3xl font-bold uppercase rounded-lg hover:bg-foreground hover:text-(--accent) w-full sm:w-auto text-center transition-colors duration-200">
						Перейти в магазин
						<span className="absolute sm:right-4 top-1/2 -translate-y-1/2 text-5xl font-normal hidden sm:inline">›</span>
					</Link>
				</div>
			</div>
		</section>
	)
}