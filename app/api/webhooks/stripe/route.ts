import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const SCHEMA = process.env.SUPABASE_SCHEMA || 'public';
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch (err: unknown) { return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 400 }); }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession;
    const bookingId = session.metadata?.booking_id;
    const slotId = session.metadata?.slot_id;
    if (!bookingId || !slotId) return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    const supabase = createAdminClient();
    await supabase.schema(SCHEMA).from('bookings').update({ status: 'paid', stripe_payment_intent_id: session.payment_intent as string, updated_at: new Date().toISOString() }).eq('id', bookingId);
    await supabase.schema(SCHEMA).from('availability_slots').update({ is_booked: true }).eq('id', slotId);
  }
  return NextResponse.json({ received: true });
}
