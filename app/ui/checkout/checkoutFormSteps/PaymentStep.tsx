"use client";

import Heading from "@/app/ui/Heading";
import PaymentOptions from "@/app/ui/checkout/PaymentSelector";

export default function PaymentStep() {
  return (
    <section className="py-2 md:py-4">
      <div className="flex items-center gap-3">
        <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">3</div>
        <Heading level={6} className="py-6 normal-case">Способ оплаты</Heading>
      </div>
      <PaymentOptions />
    </section>
  );
}
