"use client";
import Image from 'next/image';
import CropsCards from './CropsCards';

export default function CropsSection() {
	return (
		<section className="w-full">
			<div className="max-w-full mx-auto">
				<h2 className="text-3xl md:text-4xl font-bold text-center pb-8 lg:pb-12">Культуры</h2>
				<div className="flex items-center justify-center gap-2 sm:gap-4">
					<Image
						src="/cropsSection/crops-1.webp"
						width={470}
						height={244}
						alt="garlic"
						className="flex-1 min-w-25 max-w-117.5 h-auto"
					/>
					<Image
						src="/cropsSection/crops-2.webp"
						width={470}
						height={244}
						alt="shalot"
						className="flex-1 min-w-25 max-w-117.5 h-auto"
					/>
					<Image
						src="/cropsSection/crops-3.webp"
						width={470}
						height={244}
						alt="onion"
						className="flex-1 min-w-25 max-w-117.5 h-auto"
					/>
				</div>
			</div>

			<CropsCards />
		</section>
	)
}