import { ButtonHTMLAttributes, ReactNode } from 'react';
import Image from 'next/image';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  src: string;
  alt?: string;
  children: ReactNode;
}

export default function IconButton({
  src,
  alt = 'icon',
  children,
  className = '',
  ...props
}: IconButtonProps) {
  
  return (
    <button
      className={`
        flex flex-col items-center justify-center gap-1.25
        font-extrabold text-[#064929] text-[16px]
        transition-all duration-200 hover:opacity-80
        focus:outline-none focus:ring-2 focus:ring-[#064929] focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      <div className="w-12 h-12 relative">
        <Image src={src} alt={alt} fill className="object-contain" />
      </div>
      <span>{children}</span>
    </button>
  );
}

//Usage
// import IconButton from '@/components/IconButton';

// export default function Page() {
//   return (
//     <div className="flex gap-4">
//       <IconButton src="/icons/home.svg">
//         Home
//       </IconButton>
      
//       <IconButton 
//         src="/icons/profile.png" 
//         alt="Profile icon"
//         imageWidth={64}
//         imageHeight={64}
//         onClick={() => console.log('clicked')}
//       >
//         Profile
//       </IconButton>
      
//       <IconButton 
//         src="/icons/settings.svg"
//         className="bg-gray-100 p-4 rounded-xl"
//       >
//         Settings
//       </IconButton>
//     </div>
//   );
// }