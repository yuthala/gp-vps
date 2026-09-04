"use client";

interface HoneypotInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HoneypotInput({ value, onChange }: HoneypotInputProps) {
  return (
    <div 
      style={{ display: 'none', position: 'absolute', left: '-9999px' }} 
      className="opacity-0 pointer-events-none" 
      aria-hidden="true"
    >
      <label htmlFor="comment">Если вы человек, не заполняйте это текстовое поле</label>
      <input 
        id="comment"
        type="text" 
        name="comment"
        value={value}
        onChange={onChange}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
