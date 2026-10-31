import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const PRICE_MAP: Record<string, string | undefined> = {
  butaca: process.env.STRIPE_PRICE_BUTACA,
  palco: process.env.STRIPE_PRICE_PALCO,
  estreno: process.env.STRIPE_PRICE_ESTRENO,
};

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: 'Los pagos no están configurados aún. Vuelve pronto.' },
      { status: 503 },
    );
  }

  let plan: string;
  try {
    const body = await req.json();
    plan = body.plan;
  } catch {
    return NextResponse.json({ error: 'Petición inválida.' }, { status: 400 });
  }

  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Plan desconocido.' }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/patrocina/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/patrocina/cancelar`,
      metadata: { plan },
      locale: 'es',
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe/checkout]', err);
    return NextResponse.json(
      { error: 'Error al crear la sesión de pago. Inténtalo de nuevo.' },
      { status: 500 },
    );
  }
}
