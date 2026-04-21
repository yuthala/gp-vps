'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
 const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex justify-center font-bold bg-(--light-green)">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          
          {/* Section 1 */}
          <div className="border-b border-white/20 pb-3 text-foreground">
            <p className="text-sm md:text-base lg:text-lg text-center">
              <span className="text-(--secondary)">green pato</span> является зарегистрированным товарным знаком
            </p>
          </div>

          {/* Section 2 */}
          <div className="pb-3">
            <p className="text-sm md:text-base text-foreground font-medium text-center">
              Копирование материалов сайта разрешено только с письменного согласия владельца сайта.
            </p>
          </div>
					{/* Section 3 - Responsive columns */}
					<div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 py-3 text-foreground">
						<div className="sm:justify-self-start">
							<p className="text-xs md:text-sm font-medium">
								<span className="font-bold">Юридическая информация:</span> 
								<br />ИП Полоусов И. В. 
								<br />ИНН 712806468668 
								<br />ОГРНИП 323710000050917 
								<br />Тульская область, Киреевский район,
								<br />город Болохово, 
								<br />улица Ленина, д. 17, кв. 49
							</p>
						</div>
						<div className="flex flex-col gap-2 sm:justify-self-end">
							<Link 
								href="/pdf/policy.pdf" 
								className="text-sm md:text-base uppercase hover:underline hover:opacity-80 transition w-fit"
								target="_blank"
							>
								ПОЛИТИКА ОБРАБОТКИ<br /> ПЕРСОНАЛЬНЫХ ДАННЫХ
							</Link>
							<Link 
								href="/pdf/public_offer.pdf" 
								className="text-sm md:text-base hover:underline hover:opacity-80 transition w-fit"
								target="_blank"
							>
								ПУБЛИЧНАЯ ОФЕРТА
							</Link>
							<Link 
								href="/sitemap" 
								className="text-sm md:text-base lowercase underline hover:underline hover:opacity-80 transition w-fit"
								target="_blank"
							>
								Карта сайта
							</Link>
						</div>
					</div>

          {/* Section 4 */}
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-sm md:text-base text-white font-bold">Электронная почта: sales@greenpato.ru</p>
            <p className="text-lg md:text-md text-white font-bold">© green pato 2023-{currentYear}</p>
          </div>

          {/* Section 5 - 2 columns with align-center */}
					<div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/20 items-center justify-items-center sm:justify-items-start">
						<div>
							<Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl text-(--secondary) font-bold">
								green pato
							</Link>
						</div>
						<div className="flex items-center justify-center sm:justify-end w-full">
							<span className="text-xl text-foreground">powered by</span>
							<Image
								src="/icons/next.svg"
								width={80}
								height={24}
								alt="Next_logo"
								className="object-contain pl-2"
							/>
						</div>
					</div>
        </div>
      </div>
    </footer>
  );
}