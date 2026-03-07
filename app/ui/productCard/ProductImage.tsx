'use client'

import { useState } from 'react';
import Image from 'next/image';
import { ProductCard } from '../../lib/definitions';


export default function ProductImage({ data }: { data: ProductCard }) {
		const [mainImage, setMainImage] = useState(data.imageSrc[0])

		return(
		<div className="max-w-7xl mx-auto p-4 pt-0 sm:p-6 sm:pt-0 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left side - Image gallery */}
        <div className="w-full flex flex-col gap-6 md:gap-8 md:w-auto md:shrink-0">
          {/* Main big image */}
          <div className="relative w-full md:w-112.5 aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={mainImage}
              alt={data.description}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Thumbnail images */}
          <div className="flex gap-3 flex-wrap justify-center md:justify-start">
            {data.imageSrc.map((image, index) => (
              <button
                key={index}
                onClick={() => setMainImage(image)}
                className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0
                  ${mainImage === image 
                    ? 'border-green-600 ring-2 ring-green-200' 
                    : 'border-transparent hover:border-gray-300'
                  }`}
              >
                <Image
                  src={image}
                  alt={`${data.description} - view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
	)
}