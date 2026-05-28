import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slotId, bookingDate, startTime, endTime, durationMinutes, patientName, patientEmail, patientPhone, notes } = body;

    if (!slotId || !bookingDate || !startTime || !patientName || !patientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check not already booked
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('slot_id', slotId)
      .eq('booking_date', bookingDate)
      .in('status', ['confirmed', 'pending'])
      .single();

    if (existing) {
      return NextResponse.json({ error: 'This slot has just been booked. Please choose another.' }, { status: 409 });
    }

    // Get price from settings
    const { data: settings } = await supabase.from('settings').select('*').single();
    if (!settings) return NextResponse.json({ error: 'Settings not found' }, { status: 500 });

    // Create pending booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        slot_id: slotId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone || null,
        notes: notes || null,
        status: 'pending',
        amount_paid: settings.session_price_cents,
      })
      .select()
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`;

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: settings.currency,
          product_data: {
            name: `Therapy Session with Dr. Saad El Mahdy`,
            description: `${new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${startTime} · ${durationMinutes} minutes`,
          },
          unit_amount: settings.session_price_cents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: patientEmail,
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/cancelled`,
      metadata: { bookingId: booking.id },
    });

    // Store stripe session ID
    await supabase
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .eq('id', booking.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
