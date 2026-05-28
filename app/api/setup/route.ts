import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Bootstrap endpoint — seeds initial data using Supabase client (no raw SQL needed)
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-setup-secret');
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();
  const results: string[] = [];

  // Seed slots if none exist
  const { data: existing } = await supabase.from('availability_slots').select('id').limit(1);
  if (!existing || existing.length === 0) {
    const { error } = await supabase.from('availability_slots').insert([
      { day_of_week: 1, start_time: '09:00:00', end_time: '11:00:00' },
      { day_of_week: 1, start_time: '14:00:00', end_time: '16:00:00' },
      { day_of_week: 2, start_time: '10:00:00', end_time: '12:00:00' },
      { day_of_week: 2, start_time: '15:00:00', end_time: '17:00:00' },
      { day_of_week: 3, start_time: '09:00:00', end_time: '11:00:00' },
      { day_of_week: 3, start_time: '13:00:00', end_time: '15:00:00' },
      { day_of_week: 4, start_time: '10:00:00', end_time: '12:00:00' },
      { day_of_week: 4, start_time: '14:00:00', end_time: '16:00:00' },
      { day_of_week: 5, start_time: '09:00:00', end_time: '11:00:00' },
      { day_of_week: 5, start_time: '13:00:00', end_time: '15:00:00' },
    ]);
    results.push(error ? `Slots error: ${error.message}` : 'Seeded 10 slots');
  } else {
    results.push('Slots already exist');
  }

  // Seed settings if none
  const { data: existingSettings } = await supabase.from('settings').select('id').limit(1);
  if (!existingSettings || existingSettings.length === 0) {
    const { error } = await supabase.from('settings').insert({
      session_price_cents: 10000,
      currency: 'usd',
      admin_email: 'dr.saad@example.com',
      max_duration_minutes: 120,
      min_duration_minutes: 30,
      booking_advance_days: 30,
    });
    results.push(error ? `Settings error: ${error.message}` : 'Seeded settings');
  } else {
    results.push('Settings already exist');
  }

  return NextResponse.json({ ok: true, results });
}
