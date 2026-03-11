// components/Price.tsx
import React from 'react';

interface PricingProps {
  value?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Pricing({ 
  value,
  prefix,
  suffix,
  className = '',
  size = 'xl'
}: PricingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  return (
    <span className={`${sizeClasses[size]} ${className}`}>
      {prefix && <span>{prefix} </span>}
      {value !== undefined ? `${value} р` : null}
      {suffix && <span> {suffix}</span>}
    </span>
  );
}