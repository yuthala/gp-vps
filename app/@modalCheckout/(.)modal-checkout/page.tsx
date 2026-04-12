import CartModal from "../../ui/shoppingCart/cartModal";
import CartNotification from "../../ui/shoppingCart/cartNotification"

export default function CartModalPage() {
  return (
    <CartModal>
      <div>Checkout</div>
      <CartNotification />
    </CartModal>
  );
}