
import CheckoutForm from "./CheckoutForm";
import ShoppingCartComponent from "./ShoppingCartComponent";
import CheckoutTotal from "./CheckoutTotal";


export default function CheckoutComponent() {
	return(
		  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
				<div className="lg:col-span-2 space-y-8">
					{/* ЛЕВАЯ КОЛОНКА: ФОРМЫ */}
					<div className="border border-green-500 rounded-lg p-4 md:p-6 pb-6 md:pb-12">
						<CheckoutForm />
					</div>

					{/* ИТОГО */}
					<CheckoutTotal />
				</div>

        {/* ПРАВАЯ КОЛОНКА: ВАШ ЗАКАЗ */}
				<ShoppingCartComponent />
      </div>
	)
}