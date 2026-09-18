import Image from "next/image";
import Link from "next/link";
import Heading from "../../ui/Heading";

export default function VKSection() {
	return(
				<section className="w-full pb-8 md:pb-16">
				<div className="max-w-7xl bg-(--accent) px-4 md:px-8 pb-8 md:pb-12 text-base md:text-lg font-light text-foreground">
					<div className="flex items-center gap-4 pt-6 md:pt-10 pb-6 ">
						<Heading level={2} className="text-center">Наше сообщество</Heading>
							<Image
								src='/VK/vk-logo.svg'
								width={66}
								height={37}
								alt='vk logo'
							/>
					</div>
					<div className="flex flex-col sm:flex-row justify-between lg:pr-8">
						<ul className="leading-10">
							<li>анонсы поступлений</li>
							<li>новинки ассортимента</li>
							<li>фотоотчеты</li>
							<li>рекомендации по выращиванию</li>
						</ul>
						<Link href="https://vk.ru/fermatikh" target="_blank" rel="noopener noreferrer" aria-label="Перейти в VK сообщество">
							<Image
								src='/VK/qr.png'
								width={180}
								height={180}
								alt='QR code'
								className="pt-8 sm:pt-0 self-center"
							/>
						</Link>
					</div>
				</div>
		</section>
	)
}