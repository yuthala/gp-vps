// "use client";

// import { useState } from "react";
// import Heading from "../../ui/Heading";
// import Button from "../../ui/Button";
// import PaymentOptions from "@/app/ui/checkout/PaymentSelector";
// import DeliveryWidget from "../yandexDelivery/YandexDelivery";
// import { ChevronDownIcon } from '@heroicons/react/24/outline';
// import Link from "next/link";
// import clsx from "clsx";
// import { z } from "zod";

// export default function CheckoutForm() {
// 	// Track if steps 2 and 3 are visible
// 	const [showRemainingSteps, setShowRemainingSteps] = useState(false);
// 	//show Delivery Widget if respective option selected
// 	const [selectedDelivery, setSelectedDelivery] = useState('');
// 	//btn Далее disabled, если не подтверждено согласие на обработку ПД
// 	const [isChecked, setIsChecked] = useState(false);

// 	return (
// 		<form>
// 			{/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
// 			<section className="pb-4">
// 				<div className="flex items-center gap-3">
// 					<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">1</div>
// 					<Heading level={6} className="py-4 normal-case">Получатель</Heading>
// 				</div>

// 				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// 					<input type="text" placeholder="Фамилия *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
// 					<input type="text" placeholder="Имя *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
// 					<input type="email" placeholder="E-mail *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
// 					<div className="flex gap-2">
// 						<input type="tel" placeholder="Телефон *" className="border p-2 rounded w-full outline-none focus:border-green-500" required/>
// 					</div>
// 				</div>
// 				<div className="pt-6">
// 					<textarea 
// 						placeholder="Комментарий к заказу" 
// 						className="border p-2 rounded w-full h-32 resize-none outline-none focus:border-green-500"
// 					/>
// 				</div>
// 				{!showRemainingSteps && (
// 					<div className="flex flex-col">
// 						<div className="pt-6">
// 							<Button 
// 								onClick={() => setShowRemainingSteps(true)}
// 								height={40}
// 								color="#F2F9ED"
// 								backgroundColor="#40AD52"
// 								borderColor="#064929"
// 								className={clsx(
// 									"text-lg font-bold uppercase transition-all duration-200",
// 									isChecked && "hover:opacity-90 hover:shadow-md active:opacity-100 cursor-pointer",
// 									!isChecked && "opacity-50 cursor-not-allowed"
// 								)}
// 								disabled={!isChecked}
// 							>
// 								ДАЛЕЕ
// 							</Button>
// 						</div>
// 						<div className="flex pt-3">
// 							<label className="inline-flex gap-1 pr-2 pt-1.25">
// 								<input 
// 									type="checkbox" 
// 									checked={isChecked}
// 									onChange={(e) => setIsChecked(e.target.checked)}
// 									className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" 
// 								/>
// 							</label> 
// 							<div>
// 								<span className="text-foreground">Нажимая на кнопку <span className="font-bold">&quot;Далее&quot;</span>, подтверждаю свое</span>
// 								<Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;&nbsp;Cогласие на обработку персональных данных</Link>.
// 							</div>
// 						</div>
// 					</div>
// 				)}
// 			</section>

// 			{showRemainingSteps && (
// 				<>
// 				{/* ШАГ 2: ДОСТАВКА */}
// 				<section className="flex flex-col gap-4 pb-4">
// 					<div className="flex items-center gap-3">
// 						<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">2</div>
// 						<Heading level={6} className="pt-2 normal-case">Способ доставки</Heading>
// 					</div>
// 					<p className="text-lg text-foreground">Выберите курьерскую службу</p>
// 					<div className="relative">
// 						<select 
// 							value={selectedDelivery} 
// 							onChange={(e) => setSelectedDelivery(e.target.value)}
// 							className="appearance-none border p-3 rounded w-full md:w-1/2 bg-gray-50">
// 							<option value="">Выберите...</option>
// 							<option value="5post">5POST</option>
// 							<option value="ozon">ОЗОН Доставка</option>
// 							<option value="russian_post">Почта России</option>
// 							<option value="yandex">Яндекс Доставка</option>
// 						</select>
// 						<ChevronDownIcon 
// 							className="absolute 
// 								top-1/2 
// 								-translate-y-1/2 
// 								w-5 h-5 
// 								text-gray-400 
// 								pointer-events-none
// 								right-2.5 
// 								md:right-[calc(50%+10px)]"
// 						/>
// 					</div>


// 					{/* Conditionally render DeliveryWidget */}
//       		{selectedDelivery === 'yandex' && <DeliveryWidget />}
					
// 					{/* <div className="text-normal md:text-lg text-foreground pt-8">
// 						<p>Укажите адрес пункта выдачи выбранной курьерской службы.</p>
// 						<p>Посмотреть доступные адреса пунктов выдачи можно по ссылке:</p>
// 						<Link href="https://fivepost.ru/point-map/" target="_blank" className="text-green-500 underline">https://fivepost.ru</Link>
// 					</div> */}

// 					{/* <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
// 							<select className="border p-2 rounded w-full bg-gray-50">
// 								<option>Выберите...</option>
// 							</select>
// 					</div> */}
// 					{/* 
// 					<div>
// 						<input type="text" placeholder="Адрес *" className="border p-2 rounded w-full bg-gray-50" />
// 					</div> */}
					
// 					{/* <div className="pt-6 text-normal md:text-xl uppercase font-bold text-green-600">
// 						Стоимость доставки: <span className="text-red-500 pl-4"> р</span>
// 					</div> */}
// 				</section>

// 				{/* ШАГ 3: ОПЛАТА */}
// 				<section className="py-2 md:py-4">
// 					<div className="flex items-center gap-3">
// 						<div className=" text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">3</div>
// 						<Heading level={6} className="py-6 normal-case">Способ оплаты</Heading>
// 					</div>
// 					<PaymentOptions />
// 				</section>
// 			</>
// 			)}
// 		</form>
// 	) 
// }

"use client";

import { useState, useEffect, useRef } from "react";
import Heading from "../../ui/Heading";
import Button from "../../ui/Button";
import PaymentOptions from "@/app/ui/checkout/PaymentSelector";
import DeliveryWidget from "../yandexDelivery/YandexDelivery";
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Link from "next/link";
import clsx from "clsx";
import { z } from "zod";

// Zod Validation Schema
const checkoutSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна для заполнения"),
  firstName: z.string().min(1, "Имя обязательно для заполнения"),
  email: z.string().email("Некорректный формат E-mail"),
  phone: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11;
  }, "Введите полный номер телефона"),
  comment: z.string().optional(),
  deliveryMethod: z.string().min(1, "Выберите способ доставки"),
});

type FormData = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    comment: "",
    deliveryMethod: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showRemainingSteps, setShowRemainingSteps] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  // Helper function to format phone numbers to +7(XXX) XXX - XX - XX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    
    // Extract raw digits ignoring the initial country code variations
    let cleaned = digits;
    if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
      cleaned = cleaned.substring(1);
    }

    cleaned = cleaned.substring(0, 10);

    let formatted = "+7";
    if (cleaned.length > 0) {
      formatted += `(${cleaned.substring(0, 3)}`;
    } else {
      formatted += "("; // Keep bracket open if no numbers typed yet
    }
    if (cleaned.length >= 3) {
      formatted += `) ${cleaned.substring(3, 6)}`;
    }
    if (cleaned.length >= 6) {
      formatted += ` - ${cleaned.substring(6, 8)}`;
    }
    if (cleaned.length >= 8) {
      formatted += ` - ${cleaned.substring(8, 10)}`;
    }

    return formatted;
  };

  // Real-time validation for Step 1 schema
  useEffect(() => {
    const step1Schema = checkoutSchema.pick({
      lastName: true,
      firstName: true,
      email: true,
      phone: true,
    });

    const result = step1Schema.safeParse(formData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStep1Valid(result.success);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Prevent user from deleting the "+7(" prefix entirely
      if (value.length < 3) {
        setFormData((prev) => ({ ...prev, phone: "+7(" }));
        return;
      }
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Automatically add prefix and lock cursor inside brackets on focus
  const handlePhoneFocus = () => {
    if (!formData.phone) {
      setFormData((prev) => ({ ...prev, phone: "+7(" }));
    }
    
    // Push execution to the next macro task queue loop to ensure value renders first
    setTimeout(() => {
      if (phoneInputRef.current) {
        const currentLength = phoneInputRef.current.value.length;
        // If it's just the initial template, drop cursor at index 3 (inside brackets)
        const position = currentLength <= 3 ? 3 : currentLength;
        phoneInputRef.current.setSelectionRange(position, position);
      }
    }, 0);
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isStep1Valid && isChecked) {
      setShowRemainingSteps(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkoutSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path as keyof FormData;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      console.log("Form payload approved:", result.data);
    }
  };

  const isButtonEnabled = isStep1Valid && isChecked;

  return (
    <form onSubmit={handleSubmit}>
      {/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
      <section className="pb-4">
        <div className="flex items-center gap-3">
          <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">1</div>
          <Heading level={6} className="py-4 normal-case">Получатель</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Фамилия *" 
              className={clsx("border p-2 rounded w-full outline-none focus:border-green-500", errors.lastName && "border-red-500")} 
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Имя *" 
              className={clsx("border p-2 rounded w-full outline-none focus:border-green-500", errors.firstName && "border-red-500")} 
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-mail *" 
              className={clsx("border p-2 rounded w-full outline-none focus:border-green-500", errors.email && "border-red-500")} 
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input 
              ref={phoneInputRef}
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onFocus={handlePhoneFocus}
              placeholder="+7(xxx) xxx - xx - xx *" 
              className={clsx("border p-2 rounded w-full outline-none focus:border-green-500", errors.phone && "border-red-500")} 
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="pt-6">
          <textarea 
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Комментарий к заказу" 
            className="border p-2 rounded w-full h-32 resize-none outline-none focus:border-green-500" 
          />
        </div>

        {!showRemainingSteps && (
          <div className="flex flex-col">
            <div className="pt-6">
              <Button 
                onClick={handleNextStep} 
                height={40} 
                color="#F2F9ED" 
                backgroundColor="#40AD52" 
                borderColor="#064929" 
                className={clsx(
                  "text-lg font-bold uppercase transition-all duration-200",
                  isButtonEnabled && "hover:opacity-90 hover:shadow-md active:opacity-100 cursor-pointer",
                  !isButtonEnabled && "opacity-50 cursor-not-allowed"
                )} 
                disabled={!isButtonEnabled}
              >
                ДАЛЕЕ
              </Button>
            </div>
            <div className="flex pt-3">
              <label className="inline-flex gap-1 pr-2 pt-1.25">
                <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </label>
              <div>
                <span className="text-foreground">Нажимая на кнопку <span className="font-bold">&quot;Далее&quot;</span>, подтверждаю свое</span>
                <Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;&nbsp;Cогласие на обработку персональных данных</Link>.
              </div>
            </div>
          </div>
        )}
      </section>

      {showRemainingSteps && (
        <>
          {/* ШАГ 2: ДОСТАВКА */}
          <section className="flex flex-col gap-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">2</div>
              <Heading level={6} className="pt-2 normal-case">Способ доставки</Heading>
            </div>
            <p className="text-lg text-foreground">Выберите курьерскую службу</p>
            <div className="relative">
              <select 
                name="deliveryMethod"
                value={formData.deliveryMethod} 
                onChange={handleChange} 
                className={clsx("appearance-none border p-3 rounded w-full md:w-1/2 bg-gray-50", errors.deliveryMethod && "border-red-500")}
              >
                <option value="">Выберите...</option>
                <option value="5post">5POST</option>
                <option value="ozon">ОЗОН Доставка</option>
                <option value="russian_post">Почта России</option>
                <option value="yandex">Яндекс Доставка</option>
              </select>
              <ChevronDownIcon className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none right-2.5 md:right-[calc(50%+10px)]" />
            </div>
            {errors.deliveryMethod && <p className="text-red-500 text-sm">{errors.deliveryMethod}</p>}

            {formData.deliveryMethod === 'yandex' && <DeliveryWidget />}
          </section>

          {/* ШАГ 3: ОПЛАТА */}
          <section className="py-2 md:py-4">
            <div className="flex items-center gap-3">
              <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">3</div>
              <Heading level={6} className="py-6 normal-case">Способ оплаты</Heading>
            </div>
            <PaymentOptions />
            
            <div className="pt-6">
              <Button type="submit" height={45} color="#FFFFFF" backgroundColor="#40AD52" className="w-full text-lg font-bold uppercase">
                Оформить заказ
              </Button>
            </div>
          </section>
        </>
      )}
    </form>
  );
}
