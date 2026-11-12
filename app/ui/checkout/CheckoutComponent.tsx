
"use client";

import { useState } from "react";
import CheckoutTotal from "./CheckoutTotal";
import ShoppingCartComponent from "./ShoppingCartComponent";
import CheckoutFormNew from "./CheckoutFormNew";

export default function CheckoutComponent({ mockPaymentEnabled }: { mockPaymentEnabled: boolean }) {
	const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
	const [orderNumber, setOrderNumber] = useState<string | null>(null);

	return(
		  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 md:gap-8">
				<div className="lg:col-span-2 space-y-8">
					{/* ЛЕВАЯ КОЛОНКА: ФОРМЫ */}
					<div className="border border-green-500 rounded-lg p-4 md:p-6 pb-6 md:pb-12">
						{/* <CheckoutForm /> */}
						<CheckoutFormNew
							mockPaymentEnabled={mockPaymentEnabled}
							onOrderProgress={(submitting, completedOrderNumber) => {
								setIsSubmittingOrder(submitting);
								if (completedOrderNumber !== undefined) setOrderNumber(completedOrderNumber);
							}}
						/>
					</div>

					{/* ИТОГО */}
					<CheckoutTotal
						isSubmittingOrder={isSubmittingOrder}
						orderNumber={orderNumber}
						mockPaymentEnabled={mockPaymentEnabled}
					/>
				</div>

        {/* ПРАВАЯ КОЛОНКА: ВАШ ЗАКАЗ */}
				<ShoppingCartComponent />
      </div>
	)
}