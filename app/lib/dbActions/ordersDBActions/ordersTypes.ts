export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryPlatformStationId?: string | null;
  deliveryPrice: number;
  totalPrice: number;
  items: {
    productId: string;
    selectedVariantIndex: number;
    priceAtPurchase: number;
    quantity: number;
  }[];
}

export interface UpdateOrderInput {
  orderId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  deliveryPlatformStationId?: string | null;
  deliveryPrice?: number;
  totalPrice?: number;
  status?: 'new' | 'paid' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'recieved' | 'cancelled' | 'refunded';
}
