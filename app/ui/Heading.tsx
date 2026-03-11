// components/Heading.tsx
// components/Heading.tsx
import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  level: HeadingLevel;
  children: React.ReactNode;
  className?: string;
}

export default function Heading({ level, children, className = '' }: HeadingProps) {
  const HeadingTag = `h${level}` as React.ElementType;
  
  return (
    <HeadingTag className={className}>
      {children}
    </HeadingTag>
  );
}