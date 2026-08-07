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
import { getCheckoutInfo, updateCheckoutInfo } from '@/app/lib/checkoutActions';

// Zod Validation Schema with specific user descriptions
const checkoutSchema = z.object({
  lastName: z.string().min(1, "Поле обязательно: введите вашу фамилию"),
  firstName: z.string().min(1, "Поле обязательно: введите ваше имя"),
  email: z.string().min(1, "Поле обязательно").email("Неверный формат: пример email@domain.com"),
  phone: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11;
  }, "Номер телефона заполнен не полностью: должно быть 11 цифр"),
  comment: z.string().optional(),
});

type FormData = z.infer<typeof checkoutSchema>;

export default function CheckoutForm() {
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("");

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    phone: "",
    comment: "",
  });

  // Stores active validation messages displayed to the user
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showRemainingSteps, setShowRemainingSteps] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [consentLogError, setConsentLogError] = useState<string | null>(null);
  const [consentLogSent, setConsentLogSent] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isLoggingConsent, setIsLoggingConsent] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const createOrEnsureAccount = async () => {
    if (!formData.email) {
      setAccountError('Введите email для создания аккаунта.');
      return false;
    }

    setIsCreatingAccount(true);
    setAccountError(null);
    setAccountMessage(null);

    try {
      const resp = await fetch('/api/checkout/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        }),
      });

      const body = await resp.json().catch(() => null);
      if (!resp.ok) {
        const message = body?.error || 'Не удалось создать аккаунт. Попробуйте позже.';
        setAccountError(message);
        return false;
      }

      if (body?.error) {
        setAccountError(body.error);
        return false;
      }

      if (body?.created) {
        setAccountMessage('Пользователь создан. Данные для входа отправлены на email.');
      } else {
        setAccountMessage('Найден существующий аккаунт. Продолжайте оформление заказа.');
      }

      return true;
    } catch (error) {
      console.error('Create account error', error);
      setAccountError('Серверная ошибка при создании аккаунта. Попробуйте позже.');
      return false;
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const sendConsentLog = async () => {
    setIsLoggingConsent(true);
    try {
      const parsed = checkoutSchema.safeParse(formData);
      if (!parsed.success) {
        setConsentLogError('Заполните данные получателя перед подтверждением согласия.');
        setConsentLogSent(false);
        return false;
      }

      const response = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          consentType: 'personal_data_processing',
          versionAgreed: '1.0.1',
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setConsentLogError(body?.error ?? 'Не удалось сохранить согласие. Попробуйте снова.');
        setConsentLogSent(false);
        return false;
      }

      setConsentLogError(null);
      setConsentLogSent(true);
      return true;
    } catch (error) {
      console.error('Consent log error', error);
      setConsentLogError('Не удалось сохранить согласие. Попробуйте позже.');
      setConsentLogSent(false);
      return false;
    } finally {
      setIsLoggingConsent(false);
    }
  };

  // Helper function to format phone numbers to +7(XXX) XXX - XX - XX
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    
    let cleaned = digits;
    if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
      cleaned = cleaned.substring(1);
    }

    cleaned = cleaned.substring(0, 10);

    let formatted = "+7";
    if (cleaned.length > 0) {
      formatted += `(${cleaned.substring(0, 3)}`;
    } else {
      formatted += "(";
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

  // Continuous background status calculation for button availability
  useEffect(() => {
    const result = checkoutSchema.safeParse(formData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStep1Valid(result.success);

    if (typeof window !== 'undefined') {
      const info = getCheckoutInfo();
      info.userName = formData.firstName;
      info.userSecondName = formData.lastName;
      info.e_mail = formData.email;
      info.phoneNumber = formData.phone;
      info.userComments = formData.comment;
      updateCheckoutInfo(info);
    }
  }, [formData]);

  // Validate an individual field and update its description
  const validateField = (name: keyof FormData, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldSchema = checkoutSchema.pick({ [name]: true } as any);
    const result = fieldSchema.safeParse({ [name]: value });

    if (!result.success) {
      const issue = result.error.issues[0];
      setErrors((prev) => ({ ...prev, [name]: issue.message }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let targetValue = value;
    
    if (name === "phone") {
      if (value.length < 3) {
        targetValue = "+7(";
      } else {
        targetValue = formatPhone(value);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: targetValue }));

    // Real-time validation description updates as user types if an error was already visible
    if (errors[name as keyof FormData]) {
      validateField(name as keyof FormData, targetValue);
    }
  };

  // Instant validation check when user clicks or tabs away from a field
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof FormData, value);
  };

  const handlePhoneFocus = () => {
    if (!formData.phone) {
      setFormData((prev) => ({ ...prev, phone: "+7(" }));
    }
    
    setTimeout(() => {
      if (phoneInputRef.current) {
        const currentLength = phoneInputRef.current.value.length;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkoutSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path as unknown as keyof FormData;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const submissionPayload = {
      ...result.data,
      deliveryMethod: selectedDelivery,
    };

    try {
      const resp = await fetch('/api/checkout/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        const message = body?.error || 'Не удалось создать аккаунт. Попробуйте позже.';
        setConsentLogError(message);
        return;
      }

      const body = await resp.json();
      if (body.error) {
        setConsentLogError(body.error);
        return;
      }

      setConsentLogError(null);
      console.log('Form submitted successfully:', submissionPayload);
    } catch (error) {
      console.error('Checkout create-account error', error);
      setConsentLogError('Серверная ошибка при создании аккаунта. Попробуйте позже.');
    }
  };

  const isButtonEnabled = isStep1Valid && consentLogSent;

  return (
    <form onSubmit={handleSubmit}>
      {/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
      <section className="pb-4">
        <div className="flex items-center gap-3">
          <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">1</div>
          <Heading level={6} className="py-4 normal-case">Получатель</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Фамилия */}
          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Фамилия *" 
              className={clsx(
                "border p-2 rounded w-full outline-none transition-colors",
                errors.lastName ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
              )} 
            />
            {errors.lastName && <span className="text-red-500 text-xs pl-1 font-medium">{errors.lastName}</span>}
          </div>

          {/* Имя */}
          <div className="flex flex-col gap-1">
            <input 
              type="text" 
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Имя *" 
              className={clsx(
                "border p-2 rounded w-full outline-none transition-colors",
                errors.firstName ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
              )} 
            />
            {errors.firstName && <span className="text-red-500 text-xs pl-1 font-medium">{errors.firstName}</span>}
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1">
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="E-mail *" 
              className={clsx(
                "border p-2 rounded w-full outline-none transition-colors",
                errors.email ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
              )} 
            />
            {errors.email && <span className="text-red-500 text-xs pl-1 font-medium">{errors.email}</span>}
          </div>

          {/* Телефон */}
          <div className="flex flex-col gap-1">
            <input 
              ref={phoneInputRef}
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handlePhoneFocus}
              placeholder="+7(xxx) xxx - xx - xx *" 
              className={clsx(
                "border p-2 rounded w-full outline-none transition-colors",
                errors.phone ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
              )} 
            />
            {errors.phone && <span className="text-red-500 text-xs pl-1 font-medium">{errors.phone}</span>}
          </div>
        </div>

        <div className="pt-6">
          <textarea 
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Комментарий к заказу" 
            className="border p-2 rounded w-full h-32 resize-none outline-none focus:border-green-500 border-gray-300" 
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
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={!isStep1Valid || isLoggingConsent || isCreatingAccount}
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    if (!isStep1Valid) {
                      setConsentLogError('Заполните данные получателя перед подтверждением согласия.');
                      return;
                    }

                    if (checked) {
                      setConsentLogError(null);
                      setConsentLogSent(false);

                      const accountOk = await createOrEnsureAccount();
                      if (!accountOk) {
                        setIsChecked(false);
                        return;
                      }

                      const consentOk = await sendConsentLog();
                      if (consentOk) {
                        setIsChecked(true);
                      } else {
                        setIsChecked(false);
                      }
                    } else {
                      setIsChecked(false);
                      setConsentLogSent(false);
                    }
                  }}
                  className={clsx(
                    "w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500",
                    (!isStep1Valid || isLoggingConsent || isCreatingAccount) && "cursor-not-allowed opacity-50"
                  )}
                />
              </label>
              <div>
                <span className="text-foreground">Нажимая на кнопку <span className="font-bold">&quot;Далее&quot;</span>, подтверждаю свое</span>
                <Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;&nbsp;Cогласие на обработку персональных данных</Link>.
              </div>
            </div>
            {isCreatingAccount && <p className="text-gray-600 text-sm mt-2">Создание аккаунта и отправка данных в процессе...</p>}
            {isLoggingConsent && <p className="text-gray-600 text-sm mt-2">Сохранение согласия...</p>}
            {consentLogError && <p className="text-red-500 text-sm mt-2">{consentLogError}</p>}
            {accountError && <p className="text-red-500 text-sm mt-2">{accountError}</p>}
            {accountMessage && <p className="text-green-600 text-sm mt-2">{accountMessage}</p>}
            {consentLogSent && <p className="text-green-600 text-sm mt-2">Согласие сохранено.</p>}
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

          {/* ШАГ 3: ОПЛАТА */}
          <section className="py-2 md:py-4">
            <div className="flex items-center gap-3">
              <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">3</div>
              <Heading level={6} className="py-6 normal-case">Способ оплаты</Heading>
            </div>
            <PaymentOptions />
        
          </section>
        </>
      )}
    </form>
  );
}
