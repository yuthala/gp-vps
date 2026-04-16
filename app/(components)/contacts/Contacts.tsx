import Link from "next/link";
import Image from "next/image";
import Heading from "../../ui/Heading";
import ContactForm from "./ContactForm";

export default function Contacts() {
	return(
		<section className="w-full pb-8 md:pb-16">
				<div className="max-w-7xl flex flex-col items-center mx-auto">
					<Heading level={2} className="pb-8 text-center">Контакты</Heading>
						<div className="flex flex-col lg:flex-row sm:justify-around items-start lg:items-center gap-4 w-full pb-8 sm:pb-12 px-4">
							<div className="flex flex-row gap-3 xs:gap-8 justify-start items-center pb-4 sm:pb-0">
								<Image
									src='/contacts/tg-logo.svg'
									width={66}
									height={37}
									alt='tg logo'
								/>
								<Link href="htts://LukiChesnoki_bot" className="text-lg sm:text-xl font-bold text-foreground underline" target="_blank">Telegram</Link>
							</div>

							<div className="w-20 md:w-px h-px md:h-9.25 bg-gray-400 mx-auto lg:block hidden"></div>

							<div className="flex flex-row gap-3 xs:gap-8 justify-start items-center pb-4 sm:pb-0">
								<Image
									src='/contacts/max-logo.webp'
									width={66}
									height={37}
									alt='max logo'
								/>
								<Link href="https://max.ru/join/0_7PabpqGUwar2G9EW4DqqmRFmzvegRHOeobe78Y5Fc" className="text-lg sm:text-xl font-bold text-foreground underline" target="_blank">МАКС</Link>
							</div>

							<div className="w-20 md:w-px h-px md:h-9.25 bg-gray-400 mx-auto lg:block hidden"></div>

							<div className="flex flex-row gap-3 xs:gap-8 items-start pt-4 sm:pt-0">
								<Image
									src='/contacts/email-logo.svg'
									width={66}
									height={37}
									alt='email logo'
								/>
								<div className="flex flex-col md:items-center justify-center gap-1">
									<Link href="mailto:sales@greenpato.ru" className="text-lg sm:text-xl font-bold text-foreground underline" target="_blank">Электронная почта</Link>
									<Link href="mailto:sales@greenpato.ru" className="text-lg sm:text-xl font-light text-foreground underline underline-offset-3" target="_blank">sales@greenpato.ru</Link>
								</div>
							</div>
						</div>
						<ContactForm />
				</div>
		</section>
	)
}