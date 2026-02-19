import Link from "next/link";
import Image from "next/image";

export default function Contacts() {
	return(
		<section className="w-full pb-8 md:pb-16">
				<div className="max-w-7xl flex flex-col items-center mx-auto">
					<h2 className="pb-8 text-center">Контакты</h2>
					<div className="flex flex-col sm:flex-row sm:justify-around items-center gap-4 w-full pb-8">
						<div className="flex flex-row-reverse sm:flex-row gap-8 justify-end items-center min-w-67.5 pb-4 sm:pb-0">
							<Link href="htts://LukiChesnoki_bot" className="text-lg sm:text-xl font-bold text-foreground underline">Telegram</Link>
							<Image
								src='/contacts/tg-logo.svg'
								width={66}
								height={37}
								alt='vk logo'
							/>
						</div>

						<div className="w-20 sm:w-px h-px sm:h-9.25 bg-gray-400 mx-auto"></div>

						<div className="flex gap-8 items-center min-w-67.5 pt-4 sm:pt-0">
							<Image
								src='/contacts/email-logo.svg'
								width={66}
								height={37}
								alt='vk logo'
							/>
							<div className="flex flex-col sm:items-center justify-center gap-1">
								<Link href="mailto:sales@greenpato.ru" className="text-lg sm:text-xl font-bold text-foreground underline">Электронная почта</Link>
								<Link href="mailto:sales@greenpato.ru" className="text-lg sm:text-xl font-light text-foreground underline underline-offset-3">sales@greenpato.ru</Link>
							</div>
						</div>
					</div>
				</div>
		</section>
	)
}