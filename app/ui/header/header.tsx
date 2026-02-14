import GreenPatoLogo from '@/app/ui/gp-logo';
import { PhoneIcon } from '@heroicons/react/24/outline';
import TopHeaderLinks from '@/app/ui/header/header-top-liks';
import BottomHeaderLinks from '@/app/ui/header/header-bottom-links';
import Search from '@/app/ui/search';

export default function Header() {
    return (
<header className="fixed top-0 left-0 w-full h-40">
      <div className="flex justify-between items-center h-20 shrink-0 items-end rounded-lg bg-yellow-500 p-4 md:h-22">
        <PhoneIcon className="h-10 w-10 rotate-[15deg]" />
        +7977818-95-85
        <TopHeaderLinks />
      </div>
      <div className="flex justify-between items-center h-20 shrink-0 items-end rounded-lg bg-lime-500 p-4 md:h-22">
         <GreenPatoLogo /> 
          <Search placeholder="Поиск товаров..." />
        <BottomHeaderLinks />
      </div>
</header>
    );
}