'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export default function CheckoutModal({ children }: { children: ReactNode }) {
	const router = useRouter();

	const handleClose = () => {
		router.back(); // Закрывает модальное окно, возвращаясь к предыдущему маршруту
	};

	return (
		<div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={handleClose}>
			<div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
				{children}
			</div>
		</div>
	);
}