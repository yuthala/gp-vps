"use client";

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function MobileMenu({ open, onClose, children }: MobileMenuProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // allow next frame for transition
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (mounted) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mounted, onClose]);

  if (!mounted) return null;

  const menu = (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-200 ${visible ? 'opacity-30' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`relative m-4 w-full rounded-md bg-(--light-main) p-4 transition-all duration-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        style={{ boxShadow: '0 3px 40px 3px rgba(0,0,0,0.1)', color: 'var(--foreground)' }}
      >
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="absolute top-2 right-2 p-1 text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <nav className="mt-3 flex flex-col gap-2 items-center justify-center text-foreground font-bold text-base">{children}</nav>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(menu, document.body) : null;
}
