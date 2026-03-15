import Image from "next/image";
import type { CartItem } from "@/app/lib/definitions";
import Counter from "@/app/ui/counter/Counter";
import IconButton from "@/app/ui/IconButton";
import { TrashIcon } from "@heroicons/react/24/outline";

interface ShoppingCartLineProps {
  item: CartItem;
	index: number;
  // onQuantityChange?: (newQty: number) => void;
  // onRemove?: () => void;
}

export default function ShoppingCartLine({ item, index }: ShoppingCartLineProps) {

// 	const handleQuantityChange = (newQty: number) => {
// 	if (onQuantityChange) {
// 		onQuantityChange(newQty);
// 	}
// };


  return (
    <div className="grid 
      grid-cols-1 
      sm:grid-cols-[2fr_4fr_3fr_2fr_1fr] 
      gap-4 
      items-center 
      py-4 
      border-b 
      border-gray-200 
      last:border-b-0">
      
      {/* Image */}
      <div className="w-full sm:w-50 flex justify-center">
        <div className="relative w-32 h-32 sm:w-50 sm:h-50">
          <Image
            src={item.imageSrc}
            alt={item.description}
            fill
            className="rounded-lg object-cover"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex text-center sm:text-left">
        {item.description}, {item.packageSize * item.measureUnit} г
      </div>

      {/* Counter */}
      <Counter 
        initialValue={item.qty} 
        //onChange={handleQuantityChange}
        min={1}
      />

      {/* Price & Total */}
      <div className="flex flex-col items-center sm:items-end">
        <span className="text-sm text-gray-600">{item.price} ₽</span>
        <span className="text-lg font-bold">{item.totalSum} ₽</span>
      </div>

      {/* Remove button */}
      {/* <IconButton onClick={onRemove}>
        <TrashIcon className="w-5 h-5" />
      </IconButton> */}
    </div>
  );
}