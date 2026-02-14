import Image from 'next/image';

export default function GreenPatoLogo() {
  return (
    <div
      className="flex flex-row items-center gap-3"
    >
      <Image
            loading="eager"
            src="/greenPato-logo.webp"
            width={60}
            height={60}
            className="hidden md:block"
            alt="Green Pato logo"
          />
      <p className="text-xl font-extrabold text-(--secondary) leading-[1.2] ">green<br/>pato</p>
    </div>
  );
}
