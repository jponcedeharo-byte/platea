import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe no configurado.' }, { status: 503 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Firma inválida:', err);
    return NextResponse.json({ error: 'Firma inválida.' }, { status: 400 });
  }

  // En Fase 2+: aquí se actualizará Supabase con el estado del patrocinador
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('[stripe/webhook] Pago completado:', session.id, 'plan:', session.metadata?.plan);
      // TODO Fase 2: crear/actualizar registro en tabla patrocinadores de Supabase
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      console.log('[stripe/webhook] Suscripción cancelada:', sub.id);
      // TODO Fase 2: marcar patrocinador como inactivo en Supabase
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
