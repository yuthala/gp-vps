import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  height?: 52 | 58 | 80;
  color?: '#064929' | '#F2F9ED';
  borderColor?: '#064929' | 'transparent';
  backgroundColor?: '#D3D34F' | '#40AD52' | '#F2F9ED';
  className?: string;
}

export default function Button({
  children,
  height = 52,
  color = '#064929',
  borderColor = 'transparent',
  backgroundColor = '#D3D34F',
  className = '',
  ...props
}: ButtonProps) {
  
  const heightStyle = {
    52: 'h-[52px] px-6 py-3 text-base',
    58: 'h-[58px] px-7 py-4 text-lg',
    80: 'h-[80px] px-8 py-5 text-xl',
  }[height];

  const colorStyle = {
    '#064929': 'text-[#064929]',
    '#F2F9ED': 'text-[#F2F9ED]',
  }[color];

  const borderStyle = {
    '#064929': 'border border-[#064929]/60',
    'transparent': 'border border-transparent',
  }[borderColor];

  const bgStyle = {
    '#D3D34F': 'bg-[#D3D34F]',
    '#40AD52': 'bg-[#40AD52]',
    '#F2F9ED': 'bg-[#F2F9ED]',
  }[backgroundColor];

  const buttonClasses = `inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#064929] ${heightStyle} ${colorStyle} ${borderStyle} ${bgStyle} ${className}`;

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}


//Usage
{/* <Button 
  height={58}
  color="#F2F9ED"
  backgroundColor="#40AD52"
  borderColor="#064929"
>
  Click me
</Button> */}