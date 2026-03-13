"use client";

import { useState, useEffect } from "react";
import type { CartItem } from "@/app/lib/definitions";

export default function ShoppingCartComponent() {
  const [shoppingCart, setShoppingCart] = useState<{cartItems: CartItem[]} | null>(null);

  useEffect(() => {
    // This only runs on the client after hydration
    const cartData = localStorage.getItem("cartKey");
    if (cartData) {
      setShoppingCart(JSON.parse(cartData));
    }
  }, []); // Empty dependency array means this runs once after mount

  console.log(shoppingCart);

  return (
    <>
      <div>что лежит в корзине</div>
      <div>
        {shoppingCart?.cartItems && shoppingCart.cartItems.length > 0 ? (
          shoppingCart.cartItems.map((item: CartItem, index: number) => (
            <div key={index}>
              <div>{item.description}</div>
              <div>{item.imageSrc}</div>
            </div>
          ))
        ) : (
          <div>Корзина пуста</div>
        )}
      </div>
    </>
  );
}