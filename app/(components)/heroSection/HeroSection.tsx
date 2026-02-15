"use client";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full">
      <div className="max-w-7xl px-4">
        <div className="flex flex-col md:flex-row gap-4 md:gap-0 items-stretch">
		  <div className="flex w-full md:w-[40%] relative">
			{/* Decorative vertical dashed lines (aria-hidden) implemented via CSS classes */}
			<div className="absolute right-0 bottom-0">
			  <span aria-hidden className="hero-dash dash-1" />
			  <span aria-hidden className="hero-dash dash-2" />
			  <span aria-hidden className="hero-dash dash-3" />
			</div>

			<div>
							<h3 className="text-2xl lg:text-3xl font-bold text-(--secondary) pb-4"><span className="text-red-600">[</span>green pato<span className="text-red-600">]</span></h3>
							<h1 className="text-3xl lg:text-5xl font-extrabold uppercase text-foreground leading-tight pb-6">
								Питомник луковичных <br/>культур
							</h1>
							<div className="text-4xl lg:text-6xl font-extrabold uppercase text-(--secondary) sm:pl-8">
								<h2 className="pb-6">
									чеснок
								</h2>
								<h2 className="pb-6">
									лук
								</h2>
								<h2 className="pb-6">
									шалот
								</h2>
							</div>
						</div>
          </div>

          <div className="flex-1 relative">
            <div className="w-full h-64 sm:h-80 md:h-130 lg:h-150 relative rounded overflow-hidden">
              <Image
                src="/hero.jpg"
                alt="Hero"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
