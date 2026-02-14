import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

export default function GreenPatoLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-5 trailing-5 text-white`}
    >
      <Image
            loading="eager"
            src="/greenPato-logo.webp"
            width={40}
            height={40}
            className="hidden md:block"
            alt="Green Pato logo"
          />
      <p className="text-[22px]"> Green Pato  </p>
    </div>
  );
}
