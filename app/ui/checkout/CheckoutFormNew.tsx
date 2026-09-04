// "use client";

// import { useState, useEffect, useRef } from "react";
// import Heading from "../../ui/Heading";
// import Button from "../../ui/Button";
// import PaymentOptions from "@/app/ui/checkout/PaymentSelector";
// import DeliveryWidget from "../yandexDelivery/YandexDelivery";
// import { ChevronDownIcon } from '@heroicons/react/24/outline';
// import Link from "next/link";
// import clsx from "clsx";
// import { z } from "zod";
// import { getCheckoutInfo, updateCheckoutInfo } from '@/app/lib/checkoutActions';

// // Zod Schema
// const checkoutSchema = z.object({
//   lastName: z.string().min(1, "Поле обязательно: введите вашу фамилию"),
//   firstName: z.string().min(1, "Поле обязательно: введите ваше имя"),
//   email: z.string().min(1, "Поле обязательно").email("Неверный формат: пример email@domain.com"),
//   phone: z.string().refine((val) => {
//     const digits = val.replace(/\D/g, "");
//     return digits.length === 11;
//   }, "Номер телефона заполнен не полностью: должно быть 11 цифр"),
//   comment: z.string().optional(), // Поле-ловушка для ботов
// });

// type FormData = z.infer<typeof checkoutSchema>;

// export default function CheckoutForm() {
//   const phoneInputRef = useRef<HTMLInputElement>(null);
//   const [selectedDelivery, setSelectedDelivery] = useState("");

//   const [formData, setFormData] = useState({
//     lastName: "",
//     firstName: "",
//     email: "",
//     phone: "",
//     comment: "",
//   });

//   const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
//   const [showRemainingSteps, setShowRemainingSteps] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const [consentLogError, setConsentLogError] = useState<string | null>(null);
//   const [consentLogSent, setConsentLogSent] = useState(false);
//   const [accountMessage, setAccountMessage] = useState<string | null>(null);
//   const [accountError, setAccountError] = useState<string | null>(null);
//   const [isLoggingConsent, setIsLoggingConsent] = useState(false);
//   const [isCreatingAccount, setIsCreatingAccount] = useState(false);
//   const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

//   const isStep1Valid = checkoutSchema.safeParse(formData).success;

//   // Автозаполнение
//   useEffect(() => {
//     let cancelled = false;
//     const fillAuthorizedCustomer = async () => {
//       try {
//         const response = await fetch('/api/session/validate', { cache: 'no-store' });
//         if (!response.ok) return;

//         const body = await response.json();
//         if (cancelled || body.user?.role !== 'customer') return;

//         setFormData((current) => ({
//           ...current,
//           firstName: current.firstName || body.user.firstName || '',
//           lastName: current.lastName || body.user.lastName || '',
//           email: current.email || body.user.email || '',
//           phone: current.phone || body.user.phone || '',
//         }));
//       } catch (error) {
//         console.error('Authorized customer lookup error', error);
//       }
//     };

//     void fillAuthorizedCustomer();
//     return () => { cancelled = true; };
//   }, []);

//   // Синхронизация данных
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       const info = getCheckoutInfo();
//       info.userName = formData.firstName;
//       info.userSecondName = formData.lastName;
//       info.e_mail = formData.email;
//       info.phoneNumber = formData.phone;
//       info.userComments = formData.comment;
//       updateCheckoutInfo(info);
//     }
//   }, [formData]);

//   const createOrEnsureAccount = async () => {
//     if (!formData.email) {
//       setAccountError('Введите email для создания аккаунта.');
//       return false;
//     }
//     setIsCreatingAccount(true);
//     setAccountError(null);
//     setAccountMessage(null);

//     try {
//       const resp = await fetch('/api/checkout/create-account', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: formData.email,
//           name: `${formData.firstName} ${formData.lastName}`.trim(),
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           phone: formData.phone,
//         }),
//       });

//       const body = await resp.json().catch(() => null);
//       if (!resp.ok) {
//         setAccountError(body?.error || 'Не удалось создать аккаунт. Попробуйте позже.');
//         return false;
//       }
//       if (body?.error) {
//         setAccountError(body.error);
//         return false;
//       }

//       if (body?.created) {
//         setAccountMessage('Пользователь создан. Данные для входа отправлены на email.');
//       } else {
//         setAccountMessage('Найден существующий аккаунт. Продолжайте оформление заказа.');
//       }
//       return true;
//     } catch (error) {
//       setAccountError('Серверная ошибка при создании аккаунта. Попробуйте позже.');
//       return false;
//     } finally {
//       setIsCreatingAccount(false);
//     }
//   };

//   const sendConsentLog = async () => {
//     setIsLoggingConsent(true);
//     try {
//       const response = await fetch('/api/consent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           firstName: formData.firstName,
//           lastName: formData.lastName,
//           email: formData.email,
//           phone: formData.phone,
//           consentType: 'personal_data_processing',
//           versionAgreed: '1.0.1',
//         }),
//         cache: 'no-store',
//       });

//       if (!response.ok) {
//         const body = await response.json().catch(() => null);
//         setConsentLogError(body?.error ?? 'Не удалось сохранить согласие. Попробуйте снова.');
//         return false;
//       }
//       setConsentLogError(null);
//       setConsentLogSent(true);
//       return true;
//     } catch (error) {
//       setConsentLogError('Не удалось сохранить согласие. Попробуйте позже.');
//       return false;
//     } finally {
//       setIsLoggingConsent(false);
//     }
//   };

//   const formatPhone = (value: string) => {
//     const digits = value.replace(/\D/g, "");
//     let cleaned = digits;
//     if (cleaned.startsWith("7") || cleaned.startsWith("8")) cleaned = cleaned.substring(1);
//     cleaned = cleaned.substring(0, 10);

//     let formatted = "+7";
//     if (cleaned.length > 0) formatted += `(${cleaned.substring(0, 3)}`;
//     else formatted += "(";
//     if (cleaned.length >= 3) formatted += `) ${cleaned.substring(3, 6)}`;
//     if (cleaned.length >= 6) formatted += ` - ${cleaned.substring(6, 8)}`;
//     if (cleaned.length >= 8) formatted += ` - ${cleaned.substring(8, 10)}`;
//     return formatted;
//   };

//   const validateField = (name: keyof FormData, value: string) => {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const fieldSchema = checkoutSchema.pick({ [name]: true } as any);
//     const result = fieldSchema.safeParse({ [name]: value });
//     if (!result.success) {
//       setErrors((prev) => ({ ...prev, [name]: result.error.issues[0].message }));
//     } else {
//       setErrors((prev) => ({ ...prev, [name]: undefined }));
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     let targetValue = value;
    
//     if (name === "phone") {
//       targetValue = value.length < 3 ? "+7(" : formatPhone(value);
//     }

//     setFormData((prev) => ({ ...prev, [name]: targetValue }));
//     if (errors[name as keyof FormData]) validateField(name as keyof FormData, targetValue);
//   };

//   const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     validateField(name as keyof FormData, value);
//   };

//   const handlePhoneFocus = () => {
//     if (!formData.phone) setFormData((prev) => ({ ...prev, phone: "+7(" }));
//     setTimeout(() => {
//       if (phoneInputRef.current) {
//         const len = phoneInputRef.current.value.length;
//         phoneInputRef.current.setSelectionRange(len <= 3 ? 3 : len, len);
//       }
//     }, 0);
//   };

//   // Клик по кнопке «Далее»
//   const handleNextStep = async (e: React.MouseEvent) => {
//     e.preventDefault();

//     // ЗАЩИТА: Если скрытое поле заполнено — молча игнорируем или имитируем успех для бота
//     if (formData.comment && formData.comment.trim() !== "") {
//       console.warn("Honeypot triggered (Step 1). Bot detected.");
//       return; 
//     }

//     if (!isStep1Valid || !isChecked || isLoggingConsent || isCreatingAccount) return;

//     const accountOk = await createOrEnsureAccount();
//     if (!accountOk) return;

//     const consentOk = await sendConsentLog();
//     if (!consentOk) return;

//     setShowRemainingSteps(true);
//   };

//   // Финальный сабмит всей формы
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // ЗАЩИТА: Если скрытое поле заполнено — не шлем запрос на сервер
//     if (formData.comment && formData.comment.trim() !== "") {
//       console.warn("Honeypot triggered (Submit). Bot detected.");
//       return;
//     }

//     const result = checkoutSchema.safeParse(formData);
//     if (!result.success) {
//       const fieldErrors: Partial<Record<keyof FormData, string>> = {};
//       result.error.issues.forEach((issue) => {
//         fieldErrors[issue.path[0] as keyof FormData] = issue.message;
//       });
//       setErrors(fieldErrors);
//       return;
//     }

//     if (!selectedDelivery) {
//       alert("Пожалуйста, выберите способ доставки");
//       return;
//     }

//     setIsSubmittingOrder(true);

//     const submissionPayload = {
//       lastName: result.data.lastName,
//       firstName: result.data.firstName,
//       email: result.data.email,
//       phone: result.data.phone,
//       deliveryMethod: selectedDelivery,
//     };

//     try {
//       const resp = await fetch('/api/checkout/create-order', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(submissionPayload),
//       });

//       if (!resp.ok) {
//         const body = await resp.json().catch(() => null);
//         throw new Error(body?.error || 'Ошибка при оформлении заказа');
//       }

//       console.log('Order submitted successfully:', submissionPayload);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       setConsentLogError(error.message || 'Серверная ошибка при оформлении заказа.');
//     } finally {
//       setIsSubmittingOrder(false);
//     }
//   };

//   const isNextButtonEnabled = isStep1Valid && isChecked && !isLoggingConsent && !isCreatingAccount;

//   return (
//     <form onSubmit={handleSubmit}>
//       {/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
//       <section className="pb-4">
//         <div className="flex items-center gap-3">
//           <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">1</div>
//           <Heading level={6} className="py-4 normal-case">Получатель</Heading>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="flex flex-col gap-1">
//             <input 
//               type="text" 
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               placeholder="Фамилия *" 
//               className={clsx(
//                 "border p-2 rounded w-full outline-none transition-colors",
//                 errors.lastName ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
//               )} 
//             />
//             {errors.lastName && <span className="text-red-500 text-xs pl-1 font-medium">{errors.lastName}</span>}
//           </div>

//           <div className="flex flex-col gap-1">
//             <input 
//               type="text" 
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               placeholder="Имя *" 
//               className={clsx(
//                 "border p-2 rounded w-full outline-none transition-colors",
//                 errors.firstName ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
//               )} 
//             />
//             {errors.firstName && <span className="text-red-500 text-xs pl-1 font-medium">{errors.firstName}</span>}
//           </div>

//           <div className="flex flex-col gap-1">
//             <input 
//               type="email" 
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               placeholder="E-mail *" 
//               className={clsx(
//                 "border p-2 rounded w-full outline-none transition-colors",
//                 errors.email ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
//               )} 
//             />
//             {errors.email && <span className="text-red-500 text-xs pl-1 font-medium">{errors.email}</span>}
//           </div>

//           <div className="flex flex-col gap-1">
//             <input 
//               ref={phoneInputRef}
//               type="tel" 
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               onBlur={handleBlur}
//               onFocus={handlePhoneFocus}
//               placeholder="+7(xxx) xxx - xx - xx *" 
//               className={clsx(
//                 "border p-2 rounded w-full outline-none transition-colors",
//                 errors.phone ? "border-red-500 focus:border-red-500 bg-red-50/30" : "focus:border-green-500 border-gray-300"
//               )} 
//             />
//             {errors.phone && <span className="text-red-500 text-xs pl-1 font-medium">{errors.phone}</span>}
//           </div>
//         </div>

//         {/* ХОНЕЙПОТ (СКРЫТОЕ ПОЛЕ ДЛЯ ЗАЩИТЫ ОТ БОТОВ) */}
//         <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} className="opacity-0 pointer-events-none" aria-hidden="true">
//           <label htmlFor="comment">Если вы человек, оставьте это поле пустым</label>
//           <input 
//             id="comment"
//             type="text" 
//             name="comment"
//             value={formData.comment}
//             onChange={handleChange}
//             tabIndex={-1}
//             autoComplete="off"
//           />
//         </div>

//         {!showRemainingSteps && (
//           <div className="flex flex-col">
//             <div className="flex pt-5 pb-2">
//               <label className="inline-flex gap-2 items-start cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={isChecked}
//                   onChange={(e) => setIsChecked(e.target.checked)}
//                   className="w-4 h-4 mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
//                 />
//                 <div className="text-sm text-gray-700">
//                   <span>Нажимая на кнопку <span className="font-bold">&quot;Далее&quot;</span>, подтверждаю свое</span>
//                   <Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;Согласие на обработку персональных данных</Link>.
//                 </div>
//               </label>
//             </div>
//             <div className="pt-2">
//               <Button 
//                 onClick={handleNextStep} 
//                 height={40} 
//                 color="#F2F9ED" 
//                 backgroundColor="#40AD52" 
//                 borderColor="#064929" 
//                 className={clsx(
//                   "text-lg font-bold uppercase transition-all duration-200",
//                   isNextButtonEnabled && "hover:opacity-90 hover:shadow-md active:opacity-100 cursor-pointer",
//                   !isNextButtonEnabled && "opacity-50 cursor-not-allowed"
//                 )} 
//                 disabled={!isNextButtonEnabled}
//               >
//                 ДАЛЕЕ
//               </Button>
//             </div>

//             {isCreatingAccount && <p className="text-gray-600 text-sm mt-2">Создание аккаунта...</p>}
//             {isLoggingConsent && <p className="text-gray-600 text-sm mt-2">Сохранение согласия...</p>}
//             {consentLogError && <p className="text-red-500 text-sm mt-2">{consentLogError}</p>}
//             {accountError && <p className="text-red-500 text-sm mt-2">{accountError}</p>}
//             {accountMessage && <p className="text-green-600 text-sm mt-2">{accountMessage}</p>}
//             {consentLogSent && <p className="text-green-600 text-sm mt-2">Согласие сохранено.</p>}
//           </div>
//         )}
//       </section>

//       {showRemainingSteps && (
//         <>
//           {/* ШАГ 2: ДОСТАВКА */}
//           <section className="flex flex-col gap-4 pb-4 border-t pt-4 mt-4">
//             <div className="flex items-center gap-3">
//               <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">2</div>
//               <Heading level={6} className="pt-2 normal-case">Способ доставки</Heading>
//             </div>
//             <p className="text-lg text-foreground">Выберите курьерскую службу</p>
//             <div className="relative">
//               <select 
//                 value={selectedDelivery} 
//                 onChange={(e) => setSelectedDelivery(e.target.value)} 
//                 className="appearance-none border p-3 rounded w-full md:w-1/2 bg-gray-50 border-gray-300"
//               >
//                 <option value="">Выберите...</option>
//                 <option value="5post">5POST</option>
//                 <option value="ozon">ОЗОН Доставка</option>
//                 <option value="russian_post">Почта России</option>
//                 <option value="yandex">Яндекс Доставка</option>
//               </select>
//               <ChevronDownIcon className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none right-2.5 md:right-[calc(50%+10px)]" />
//             </div>

//             {selectedDelivery === 'yandex' && <DeliveryWidget />}
//           </section>

//           {/* ШАГ 3: ОПЛАТА */}
//           <section className="py-2 md:py-4 border-t mt-4">
//             <div className="flex items-center gap-3">
//               <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">3</div>
//               <Heading level={6} className="py-6 normal-case">Способ оплаты</Heading>
//             </div>
//             <PaymentOptions />
//           </section>

//           {/* ФИНАЛЬНАЯ КНОПКА ОТПРАВКИ */}
//           <div className="pt-6 border-t mt-6">
//             <Button
//               type="submit"
//               height={52}
//               color="text-white"
//               backgroundColor="#40AD52"
//               borderColor="#064929"
//               className={clsx(
//                 "w-full text-xl font-bold uppercase transition-all duration-200",
//                 !isSubmittingOrder ? "hover:bg-opacity-90 cursor-pointer" : "opacity-50 cursor-not-allowed"
//               )}
//               disabled={isSubmittingOrder}
//             >
//               {isSubmittingOrder ? "ОФОРМЛЕНИЕ..." : "ПОДТВЕРДИТЬ ЗАКАЗ"}
//             </Button>
//             {consentLogError && <p className="text-red-500 text-sm mt-2 text-center">{consentLogError}</p>}
//           </div>
//         </>
//       )}
//     </form>
//   );
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

// Импортируем созданные ранее подкомпоненты
import ReceiverStep from "@/app/ui/checkout/checkoutFormSteps/ReceiverStep";
import HoneypotInput from "@/app/ui/checkout/checkoutFormSteps/HoneypotImput";

// Zod Schema
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

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showRemainingSteps, setShowRemainingSteps] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [consentLogError, setConsentLogError] = useState<string | null>(null);
  const [consentLogSent, setConsentLogSent] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [isLoggingConsent, setIsLoggingConsent] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  //const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const isStep1Valid = checkoutSchema.safeParse(formData).success;
  // Автозаполнение
  useEffect(() => {
    let cancelled = false;
    const fillAuthorizedCustomer = async () => {
      try {
        const response = await fetch('/api/session/validate', { cache: 'no-store' });
        if (!response.ok) return;

        const body = await response.json();
        if (cancelled || body.user?.role !== 'customer') return;

        setFormData((current) => ({
          ...current,
          firstName: current.firstName || body.user.firstName || '',
          lastName: current.lastName || body.user.lastName || '',
          email: current.email || body.user.email || '',
          phone: current.phone || body.user.phone || '',
        }));
      } catch (error) {
        console.error('Authorized customer lookup error', error);
      }
    };

    void fillAuthorizedCustomer();
    return () => { cancelled = true; };
  }, []);

  // Синхронизация данных
  useEffect(() => {
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
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        }),
      });

      const body = await resp.json().catch(() => null);
      if (!resp.ok) {
        setAccountError(body?.error || 'Не удалось создать аккаунт. Попробуйте позже.');
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setAccountError('Серверная ошибка при создании аккаунта. Попробуйте позже.');
      return false;
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const sendConsentLog = async () => {
    setIsLoggingConsent(true);
    try {
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
        return false;
      }
      setConsentLogError(null);
      setConsentLogSent(true);
      return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setConsentLogError('Не удалось сохранить согласие. Попробуйте позже.');
      return false;
    } finally {
      setIsLoggingConsent(false);
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    let cleaned = digits;
    if (cleaned.startsWith("7") || cleaned.startsWith("8")) cleaned = cleaned.substring(1);
    cleaned = cleaned.substring(0, 10);

    let formatted = "+7";
    if (cleaned.length > 0) formatted += `(${cleaned.substring(0, 3)}`;
    else formatted += "(";
    if (cleaned.length >= 3) formatted += `) ${cleaned.substring(3, 6)}`;
    if (cleaned.length >= 6) formatted += ` - ${cleaned.substring(6, 8)}`;
    if (cleaned.length >= 8) formatted += ` - ${cleaned.substring(8, 10)}`;
    return formatted;
  };

  const validateField = (name: keyof FormData, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldSchema = checkoutSchema.pick({ [name]: true } as any);
    const result = fieldSchema.safeParse({ [name]: value });
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [name]: result.error.issues[0].message }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let targetValue = value;
    
    if (name === "phone") {
      targetValue = value.length < 3 ? "+7(" : formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [name]: targetValue }));
    if (errors[name as keyof FormData]) validateField(name as keyof FormData, targetValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof FormData, value);
  };

  const handlePhoneFocus = () => {
    if (!formData.phone) setFormData((prev) => ({ ...prev, phone: "+7(" }));
    setTimeout(() => {
      if (phoneInputRef.current) {
        const len = phoneInputRef.current.value.length;
        phoneInputRef.current.setSelectionRange(len <= 3 ? 3 : len, len);
      }
    }, 0);
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (formData.comment && formData.comment.trim() !== "") {
      console.warn("Honeypot triggered (Step 1). Bot detected.");
      return; 
    }

    if (!isStep1Valid || !isChecked || isLoggingConsent || isCreatingAccount) return;

    const accountOk = await createOrEnsureAccount();
    if (!accountOk) return;

    const consentOk = await sendConsentLog();
    if (!consentOk) return;

    setShowRemainingSteps(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.comment && formData.comment.trim() !== "") {
      console.warn("Honeypot triggered (Submit). Bot detected.");
      return;
    }

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as keyof FormData] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!selectedDelivery) {
      alert("Пожалуйста, выберите способ доставки");
      return;
    }

    //setIsSubmittingOrder(true);

    const submissionPayload = {
      lastName: result.data.lastName,
      firstName: result.data.firstName,
      email: result.data.email,
      phone: result.data.phone,
      deliveryMethod: selectedDelivery,
    };

    try {
      const resp = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => null);
        throw new Error(body?.error || 'Ошибка при оформлении заказа');
      }

      console.log('Order submitted successfully:', submissionPayload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setConsentLogError(error.message || 'Серверная ошибка при оформлении заказа.');
    } finally {
      //setIsSubmittingOrder(false);
    }
  };

  const isNextButtonEnabled = isStep1Valid && isChecked && !isLoggingConsent && !isCreatingAccount;
    return (
    <form onSubmit={handleSubmit}>
      {/* ШАГ 1: ПОЛУЧАТЕЛЬ */}
      <section className="pb-4">
        <div className="flex items-center gap-3">
          <div className="text-green-600 text-lg font-bold w-8 h-8 rounded-md border border-green-400 flex items-center justify-center">1</div>
          <Heading level={6} className="py-4 normal-case">Получатель</Heading>
        </div>
        <ReceiverStep 
          formData={formData}
          errors={errors}
          phoneInputRef={phoneInputRef}
          handleChange={handleChange}
          handleBlur={handleBlur}
          handlePhoneFocus={handlePhoneFocus}
        />

        <HoneypotInput 
          value={formData.comment}
          onChange={handleChange}
        />

        {!showRemainingSteps && (
          <div className="flex flex-col">
            <div className="flex pt-5 pb-2">
              <label className="inline-flex gap-2 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <div className="text-sm text-gray-700">
                  <span>Нажимая на кнопку <span className="font-bold">&quot;Далее&quot;</span>, подтверждаю свое</span>
                  <Link href="/pdf/agreement_pd.pdf" className="text-green-600 underline" target="_blank">&nbsp;Согласие на обработку персональных данных</Link>.
                </div>
              </label>
            </div>
            <div className="pt-2">
              <Button 
                onClick={handleNextStep} 
                height={40} 
                color="#F2F9ED" 
                backgroundColor="#40AD52" 
                borderColor="#064929" 
                className={clsx(
                  "text-lg font-bold uppercase transition-all duration-200",
                  isNextButtonEnabled && "hover:opacity-90 hover:shadow-md active:opacity-100 cursor-pointer",
                  !isNextButtonEnabled && "opacity-50 cursor-not-allowed"
                )} 
                disabled={!isNextButtonEnabled}
              >
                ДАЛЕЕ
              </Button>
            </div>

            {isCreatingAccount && <p className="text-gray-600 text-sm mt-2">Создание аккаунта...</p>}
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
          <section className="flex flex-col gap-4 pb-4 border-t pt-4 mt-4">
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
          <section className="py-2 md:py-4 border-t mt-4">
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
