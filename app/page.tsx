import AdvantagesSection from "./(components)/advantagesSection/AdvantagesSection";
import CropsSection from "./(components)/cropsSection/CropsSection";
import HeroSection from "./(components)/heroSection/HeroSection";
import BookingSection from "./(components)/bookingSection/BookingSection";
import DeliverySection from "./(components)/deliverySection/DeliverySection";
import OurOzonShop from "./(components)/ourOzonShop/OurOzonShop";
import VKSection from "./(components)/VKSection/VKSection";
import Contacts from "./(components)/contacts/Contacts";
import MainPageCardsSection from "./(components)/mainPageCardsSection/MainPageCardsSection";

export default function Home() {
	return (
		<div className="w-full">
			<div className="w-full flex justify-center">
				<div className="w-full max-w-7xl min-w-xs">
					<HeroSection />
					<MainPageCardsSection />
					<AdvantagesSection />
					<CropsSection />
					<BookingSection />
					<DeliverySection />
					<OurOzonShop />
					<VKSection />
					<Contacts />
				</div>
			</div>
		</div>
	);
}
