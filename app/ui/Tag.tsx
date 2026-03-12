
interface TagProps {
  children: React.ReactNode;
}

export default function Tag({ children }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        h-6.5 px-3.5
        text-[16px] font-extrabold
        rounded-[30px] w-fit
      `}
      style={{
        backgroundColor: 'var(--accent, #D3D34F)',
        color: 'var(--foreground, #064929)'
      }}
    >
      {children}
    </span>
  );
}