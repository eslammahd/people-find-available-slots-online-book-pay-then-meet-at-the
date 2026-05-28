import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

  try {
    const supabase = createServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) return NextResponse.json({ error: 'No booking found' }, { status: 404 });

    // Update booking status
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        stripe_payment_intent_id: session.payment_intent as string,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error || !booking) {
      // Booking might already be confirmed (duplicate call)
      const { data: existing } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
      if (existing) return NextResponse.json({ booking: existing });
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking });
  } catch (err) {
    console.error('Confirm error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
