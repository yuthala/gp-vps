import Image from "next/image";
import Link from "next/link";
import type { MiniProductCard } from "@/app/lib/definitions"; // Adjust import as needed
import { getRecommendedProducts } from "../../lib/actions";

interface MiniProductCardProps {
	imageSrc: string;
	shortDescription: string;
	price: number;
	pathName?: string;
	cropName?: string;
}

export default function MiniProductCardComponent({imageSrc, shortDescription, price, pathName, cropName} :  MiniProductCardProps ) {

  return (
			<Link href={`/catalog/${pathName}/${cropName}`}>
				<div className="
					w-full 
					h-41 
					rounded-lg 
					shadow-sm 
					hover:shadow-md 
					transition-shadow 
					duration-200 
					flex 
					overflow-hidden
					bg-white
					border border-gray-200
					p-2 sm:p-4
			">
      {/* Image - fixed size 124x124 */}
      <div className="shrink-0 w-31 m-auto ml-2">
        <div className="relative w-full h-full">
          <Image
            src={imageSrc}
            alt={shortDescription}
            fill
            className="rounded object-cover"
            sizes="124px"
          />
        </div>
      </div>

      {/* Content on the right */}
      <div className="flex flex-col justify-between flex-1 pl-3">
        {/* Short description */}
        <div className="text-xl font-extrabold text-foreground line-clamp-2">
          {shortDescription || ''}
        </div>

        {/* Price */}
        <div className="text-2xl font-semibold text-(--secondary)">
          {price} ₽
        </div>
      </div>
    </div>
	</Link>
  );
}