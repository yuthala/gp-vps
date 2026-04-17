import Image from "next/image";
import Button from "../Button";
import Link from "next/link";
import Heading from "../Heading";

export default function CartEmpty() {
	return(
		<div className="max-w-7xl w-full mx-auto py-[10vh] sm:py-[20vh]">
			<div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 p-6 md:p-8">
				{/* Icon on the left */}
				<div className="shrink-0">
					<Image
							src="/icons/empty_cart.svg"
							alt="empty_cart"
							width={196}
							height={196}
							className=" object-cover"
						/>
				</div>

				{/* Right block with text and button */}
				<div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left">
					{/* Phrase */}
					<Heading level={2} className="text-2xlfont-semibold text-foreground">Ваша корзина пуста</Heading>
					
					{/* Button */}
					<Link href="/catalog">
						<Button
							height={58}
							backgroundColor="#40AD52"
							color={'text-white'}
							className="px-8 py-3 rounded-lg uppercase text-lg font-extrabold"
						>
								За покупками
						</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}