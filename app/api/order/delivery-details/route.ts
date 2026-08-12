import { NextResponse } from 'next/server';
import { sendOrderDeliveryDetailsEmail } from '@/app/lib/email';
import type { CartItem } from '@/app/lib/definitions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      name,
      phone,
      comment,
      deliveryPointAddress,
      cartItems,
      goodsTotal,
      deliveryPrice,
      checkoutUrl,
    } = body as {
      email: string;
      name: string;
      phone?: string;
      comment?: string;
      deliveryPointAddress?: string;
      cartItems: CartItem[];
      goodsTotal: number;
      deliveryPrice: number;
      checkoutUrl: string;
    };

    if (!email || !name || typeof goodsTotal !== 'number' || typeof deliveryPrice !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await sendOrderDeliveryDetailsEmail({
      to: email,
      name,
      phone,
      comment,
      deliveryPointAddress,
      cartItems,
      goodsTotal,
      deliveryPrice,
      checkoutUrl,
    });

    if (result.provider !== 'smtp') {
      return NextResponse.json(
        { error: 'Email was not sent because SMTP is not configured or failed to send.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delivery details route error', error);
    return NextResponse.json({ error: 'Unable to send delivery details email' }, { status: 500 });
  }
}
