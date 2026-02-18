'use client';
import Link from "next/link";

export default function BookingSection() {
	return (
		<section className="w-full pb-8 md:pb-16">
				<div className="w-full relative bg-(--secondary) px-4 md:px-8 pb-8 md:pb-12 text-base md:text-lg font-light text-white">
					<h2 className="booking-heading pt-6 md:pt-10 pb-6 text-center">Бронирование</h2>
					<p className="pb-2">Так бывает, что желаемого  сорта нет в наличии. В этом случае вы можете забронировать понравившийся товар и получить его, когда он появится на складе. Сроки поставки указаны на странице бронирования. Поставки по забронированным заказам осуществляются в приоритете. </p>
					<p className="pb-2">Некоторые позиции нашего каталога производятся в  небольшом количестве и не поступают в продажу. Вы их можете приобрести только с предварительным бронированием.</p>
					<p className="pb-2">Бронирование осуществляется без предоплаты. Цена выкупа брони устанавливается на момент поступления товара на склад.  Если цена вас не устроит, вы можете отказаться выкупать ваш заказ без каких-либо штрафов. Ориентировочные цены вы можете посмотреть в текущем Каталоге. На отдельные позиции фактические цены на момент выкупа могут значительно отличаться  от текущих в Каталоге  в случае неурожая, высокого спроса и прочих обстоятельств.</p>
					<p className="pb-4 md:pb-12">Для ознакомления со списком товарных позиций, которые доступны к бронированию в текущий момент, перейдите по ссылке ниже. </p>
					{/* поменять ссылку на страницу бронирования  */}
					<div className="flex justify-center items-center">
						<Link 
              href="/booking" 
              className="relative bg-(--accent) px-16 md:px-24 py-3 md:py-4 text-foreground text-xl sm:text-2xl md:text-3xl font-bold uppercase rounded-lg hover:bg-foreground hover:text-(--accent) w-full sm:w-auto text-center transition-colors duration-200"
            >
              Забронировать
              <span className="absolute sm:right-4 top-1/2 -translate-y-1/2 text-5xl font-normal hidden sm:inline">›</span>
            </Link>
					</div>
				</div>
		</section>
	)
}
