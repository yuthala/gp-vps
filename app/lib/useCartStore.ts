//функция, которая при каждом изменении количества товаров в корзине обновляет куки
// 'use client'
import { create } from 'zustand';
import { setCookie } from 'cookies-next';
import { persist } from 'zustand/middleware'

interface CartState {
  items: string[]; // массив ID товаров
  addItem: (id: string) => void;
	deleteItem: (id: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (id) =>
        set((state) => {
          const newItems = [...state.items, id]
          // Sync cookie for the Server
          setCookie('cart_count', newItems.length, { maxAge: 60 * 60 * 24 * 7 })
          return { items: newItems }
        }),

			deleteItem: (id) =>
				set((state) => {
					const index = state.items.indexOf(id);
					if (index === -1) return state; // Nothing found

					const newItems = [...state.items];
					newItems.splice(index, 1); // Remove only 1 instance

					setCookie('cart_count', newItems.length, { maxAge: 60 * 60 * 24 * 7 });
					return { items: newItems };
				}),
    }),
    {
      name: 'cart-storage', // Key name in localStorage
    }
  )
)

