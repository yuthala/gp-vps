import clsx from 'clsx';
import Image from 'next/image';

export default function OnStock({ onStockStatus}: { onStockStatus: string }) {
  return (
    <span
      className='rounded-full pt-3 pb-8 text-xl'>
      {onStockStatus === 'available' ? (
        <div className="flex gap-2 items-center">
					<Image
						src='/icons/yes.png'
						width={19}
						height={16}
						alt='available'
						className="object-cover"
					/>
					В наличии
          {/* <ClockIcon className="ml-1 w-4 text-gray-500" /> */}
        </div>
      ) : null}
      {onStockStatus === 'not_available' ? (
        <div className="flex gap-2 items-center">
					<Image
						src='/icons/notavail.png'
						width={13}
						height={14}
						alt='not available'
						className="object-cover"
					/>
          Закончился
          {/* <CheckIcon className="ml-1 w-4 text-white" /> */}
        </div>
      ) : null}
			{onStockStatus === 'expected' ? (
        <div className="flex gap-2 items-center">
					<Image
						src='/icons/excl.png'
						width={13}
						height={16}
						alt='expected'
						className="object-cover"
					/>
          Предзаказ открыт
          {/* <CheckIcon className="ml-1 w-4 text-white" /> */}
        </div>
      ) : null}
    </span>
  );
}
