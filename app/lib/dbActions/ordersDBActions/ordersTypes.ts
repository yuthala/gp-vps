export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerUserId?: string | null;
  deliveryPlatformStationId?: string | null;
  deliveryPointAddress?: string | null;
  customerComment?: string | null;
  deliveryPrice: number;
  totalPrice: number;
  checkoutRequestId: string;
  paymentMethod: string;
  paymentReference: string;
  yandexOperatorRequestId: string;
  yandexOffersResponse: Record<string, unknown>;
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

export interface AdminOrderListItem {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  status: string;
  created_at: Date | string;
  yandex_request_id: string | null;
  yandex_cancellation_status: string | null;
  yandex_request_info: unknown;
}
