import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculatePrice } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
const PRICE_PER_HOUR_CENTS = parseInt(process.env.PRICE_PER_HOUR_CENTS || '15000');
const SCHEMA = process.env.SUPABASE_SCHEMA || 'public';
export async function POST(req: NextRequest) {
  try {
    const { slotId, guestName, guestEmail, guestPhone, durationMinutes, notes } = await req.json();
    if (!slotId || !guestName || !guestEmail || !durationMinutes) return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    if (durationMinutes > 120) return NextResponse.json({ error: 'Maximum session duration is 2 hours.' }, { status: 400 });
    const supabase = createAdminClient();
    const { data: slot, error: slotError } = await supabase.schema(SCHEMA).from('availability_slots').select('*').eq('id', slotId).eq('is_booked', false).single();
    if (slotError || !slot) return NextResponse.json({ error: 'This slot is no longer available.' }, { status: 409 });
    const priceCents = calculatePrice(durationMinutes, PRICE_PER_HOUR_CENTS);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const { data: booking, error: bookingError } = await supabase.schema(SCHEMA).from('bookings').insert({
      slot_id: slotId, guest_name: guestName, guest_email: guestEmail, guest_phone: guestPhone || null,
      duration_minutes: durationMinutes, price_cents: priceCents, status: 'pending', notes: notes || null,
    }).select().single();
    if (bookingError || !booking) return NextResponse.json({ error: 'Failed to create booking.' }, { status: 500 });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: guestEmail,
      line_items: [{ price_data: { currency: 'usd', unit_amount: priceCents, product_data: { name: 'Therapy Session \u2014 Dr. Saad El Mahdy', description: `${durationMinutes}-minute online session via Google Meet` } }, quantity: 1 }],
      metadata: { booking_id: booking.id, slot_id: slotId, guest_name: guestName, guest_email: guestEmail, duration_minutes: String(durationMinutes) },
      success_url: `${baseUrl}/booking/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book?cancelled=true`,
    });
    await supabase.schema(SCHEMA).from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id);
    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal error' }, { status: 500 });
  }
}
