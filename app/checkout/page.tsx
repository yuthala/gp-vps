import Link from "next/link";
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Heading from "../ui/Heading";
import CheckoutComponent from "@/app/ui/checkout/CheckoutComponent";

export default function CheckoutPage() {
	return(
		<div className="max-w-7xl w-full mx-auto pb-20 px-2 xs:px-4">
      <div>
				<Link href="/shopping-cart" className="text-green-600 text-lg font-extrabold pb-4 flex items-center hover:underline hover:underline-offset-4">
					<ChevronLeftIcon className="w-6 h-6 pr-1" />
					Вернуться в корзину
				</Link>
        <Heading level={2} className="py-4">Оформление заказа</Heading>
      </div>
			<CheckoutComponent />
    </div>
	)
}