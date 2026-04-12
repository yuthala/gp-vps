//функция, которая при каждом изменении количества товаров в корзине обновляет куки
// 'use client'
import { create } from 'zustand';
import { setCookie } from 'cookies-next';
import { persist } from 'zustand/middleware';
import { IDPkgSize } from './definitions';

interface CartState {
  items: IDPkgSize[]; // массив ID товаров
  id_sizeModal: IDPkgSize;
  	addItem: (id: string, pkgSize: number) => void;
		deleteItem: (id: string, pkgSize: number) => void;
		clearData: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
	  id_sizeModal: {
		id: '',
		pkgSize: 0
	  },

		addItem: (id, pkgSize) =>
			set((state) => {
		const dataForModal = state.id_sizeModal;
		dataForModal.id = id;
		dataForModal.pkgSize = pkgSize;
				// Проверяем наличие объекта с ТАКИМ ЖЕ id И ТАКИМ ЖЕ pkgSize
				const isExist = state.items.filter(item => item.id === id).filter(item => item.pkgSize === pkgSize);
				if (isExist.length !== 0) {
					return state; // Если такая комбинация уже есть, ничего не меняем
				}
				const newItems = [...state.items, { id, pkgSize }]
				// Sync cookie for the Server
				//setCookie('cart_count', newItems.length, { maxAge: 60 * 60 * 24 * 7 })
				return { items: newItems, id_sizeModal: dataForModal }
			}),

		deleteItem: (id, pkgSize) =>
			set((state) => {
				// Ищем индекс конкретной комбинации товара и фасовки
				const index = state.items.findIndex(
					(item) => item.id === id && item.pkgSize === pkgSize
				);

				const newItems = [...state.items];
				newItems.splice(index, 1); // Remove only 1 instance

				setCookie('cart_count', newItems.length, { maxAge: 60 * 60 * 24 * 7 });
				return { items: newItems };
			}),

		clearData: () => {
			// Option A: Set cookie to 0
			setCookie('cart_count', 0); 
			
			// Option B: Completely remove the cookie
			// deleteCookie('cart_count');

			set({ items: [] }); // Correct way to update state in Zustand
		},
    }),
    {
      name: 'cart-storage', // Key name in localStorage
    }
  )
)

