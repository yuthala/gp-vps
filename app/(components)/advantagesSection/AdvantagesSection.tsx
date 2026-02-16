"use client";
const cards = [
	{iconSrc: '/advantagesSection/adv-1.svg', iconWidth: 40, iconHeight: 40, heading: 'Собственное производство', description: (
		<>
			Мы являемся производителем. Многие люди уже оценили качество нашей продукции и стали нашими постоянными покупателями. На этом сайте вы можете приобрести продукцию <span style={{color: 'var(--secondary)'}}>green pato</span> без посредников, напрямую.
		</>
	)},
	{iconSrc: '/advantagesSection/adv-2.svg', iconWidth: 48, iconHeight: 48, heading: 'Удобная доставка по РФ', description: 'Укажите адрес доставки в форме заказа - и наш менеджер подберет оптимальный вариант. Мы сотрудничаем с несколькими логистическими операторами, и всегда сможем подобрать быструю и удобную доставку вашего заказа.'},
	{iconSrc: '/advantagesSection/adv-3.svg', iconWidth: 40, iconHeight: 40, heading: 'Широкий ассортимент', description: 'Укажите адрес доставки в форме заказа - и наш менеджер подберет оптимальный вариант. Мы сотрудничаем с несколькими логистическими операторами, и всегда сможем подобрать быструю и удобную доставку вашего заказа.'},
	{iconSrc: '/advantagesSection/adv-4.svg', iconWidth: 30, iconHeight: 30, heading: 'У нас нет минимального заказа', description: 'Да, заказывайте сколько хотите. Отправим любое количество!'}
]

export default function AdvantagesSection() {
  return (
    <section className="flex justify-center w-full pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="advantages-heading pb-4 sm:pb-8 lg:pb-12">Здесь вы можете приоберсти оригинальную продукцию <span className="text-3xl lg:text-4xl lowercase font-bold text-(--secondary)">green pato</span></h2>

				<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground font-light text-lg leading-[1.3] auto-rows-fr">
						{cards.map((card) => {
								return (
										<div key={card.heading} className="p-4 border border-gray-400 rounded flex flex-col items-center text-center"> 
												<img src={card.iconSrc} alt={`Icon advantage ${card.heading}`} width={card.iconWidth ?? 40} height={card.iconHeight ?? 40} className="mb-4" />
												<h4 className="py-2">{card.heading}</h4>
												<p className="advantages-text mt-2">{card.description}</p>
										</div>
								)
						})}
				</div>
      </div>
    </section>
  );
}
