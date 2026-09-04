"use client";

import clsx from "clsx";

interface ReceiverStepProps {
  formData: {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
  };
  errors: Partial<Record<string, string>>;
  phoneInputRef: React.RefObject<HTMLInputElement | null>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handlePhoneFocus: () => void;
}

export default function ReceiverStep({
  formData,
  errors,
  phoneInputRef,
  handleChange,
  handleBlur,
  handlePhoneFocus,
}: ReceiverStepProps) {
  return (
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
  );
}
