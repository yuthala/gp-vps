import Image from "next/image";
import { Delivery } from "../../lib/definitions";

const deliveryCards: Delivery[] = [
	{imageSrc: '/deliverySection/5post.jpg', imageDescription: '5post'},
	{imageSrc: '/deliverySection/boxberry.jpg', imageDescription: 'boxberry'},
	{imageSrc: '/deliverySection/yadelivery.jpg', imageDescription: 'yadelivery'},
	{imageSrc: '/deliverySection/ozon.jpg', imageDescription: 'ozon'},
	{imageSrc: '/deliverySection/cdek.jpg', imageDescription: 'cdek'},
	{imageSrc: '/deliverySection/pochta.jpg', imageDescription: 'pochta'}
];

export default function DeliverySection() {
	return (
		<section className="w-full pb-8 md:pb-16">
			<div className="max-w-7xl mx-auto grid justify-center">
				<h2 className="text-3xl md:text-4xl font-bold text-center pb-8 lg:pb-12">Доставка и оплата</h2>
				{/* <!-- 3-Column Grid --> */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
					{/* <!-- Column 1 --> */}
					{deliveryCards.map((card, index) => {
						return (
							<div  key={index} className="flex justify-center items-center">
								<Image
									src={card.imageSrc}
									width={380}
									height={190}
									alt={card.imageDescription}
									className="rounded-sm w-full max-w-70 xs:max-w-[320px] sm:max-w-87.5 md:max-w-100 h-auto object-cover"
								/>
						</div>
							)
					} )}
				</div>
				{/* text div  */}
				<div className="px-4 md:px-8 text-base md:text-lg font-light text-foreground pt-4 md:pt-8">
					<p className="pb-2">Выберите желаемый вариант доставки при оформлении заказа и оплатите заказ. Доставка осуществляется в пункт выдачи  выбранного логистического оператора или постамат, если он доступен в этом пункте. Пожалуйста, точно указывайте  адрес пункта выдачи и мобильный телефон получателя. На этот номер придет уведомление о готовности заказа к выдаче. Наш менеджер может связаться с вами для уточнения адреса пункта выдачи, если это будет необходимо.</p>
					<p className="pb-2">Доступны следующие способы оплаты: банковской картой на сайте,  через Систему Быстрых Платежей.
После получения вашего заказа мы начнем его собирать. Сбор заказа занимает 1-3 рабочих дня.</p>
					<p className="pb-2">После  передачи заказа на доставку логистическому оператору вы получите автоматическое уведомление с деталями доставки . Если у вас возникнут сложности с получением заказа, свяжитесь с нами, пожалуйста.</p>
				</div>
			</div>
		</section>
	)
}