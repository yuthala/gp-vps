"use client";

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Heading from "@/app/ui/Heading";
import DeliveryWidget from "@/app/ui/yandexDelivery/YandexDelivery";

interface DeliveryStepProps {
  selectedDelivery: string;
  setSelectedDelivery: (value: string) => void;
}

export default function DeliveryStep({ selectedDelivery, setSelectedDelivery }: DeliveryStepProps) {
  return (
    <section className="flex flex-col gap-4 pb-4">
      <div className="flex items-center gap-3">
        <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">2</div>
        <Heading level={6} className="pt-2 normal-case">Способ доставки</Heading>
      </div>
      <p className="text-lg text-foreground">Выберите курьерскую службу</p>
      <div className="relative">
        <select 
          value={selectedDelivery} 
          onChange={(e) => setSelectedDelivery(e.target.value)} 
          className="appearance-none border p-3 rounded w-full md:w-1/2 bg-gray-50 border-gray-300"
        >
          <option value="">Выберите...</option>
          <option value="5post">5POST</option>
          <option value="ozon">ОЗОН Доставка</option>
          <option value="russian_post">Почта России</option>
          <option value="yandex">Яндекс Доставка</option>
        </select>
        <ChevronDownIcon className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none right-2.5 md:right-[calc(50%+10px)]" />
      </div>

      {selectedDelivery === 'yandex' && <DeliveryWidget />}
    </section>
  );
}
