import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// One-time migration endpoint — protected by secret
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-migrate-secret');
  if (secret !== process.env.MIGRATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient();

  // Run migrations via RPC (plain SQL via supabase rpc if available, otherwise use client)
  const migrations = [
    `CREATE TABLE IF NOT EXISTS "user_32b62920".availability_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS "user_32b62920".bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slot_id UUID REFERENCES "user_32b62920".availability_slots(id),
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      duration_minutes INT NOT NULL,
      patient_name TEXT NOT NULL,
      patient_email TEXT NOT NULL,
      patient_phone TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      stripe_payment_intent_id TEXT,
      amount_paid INT,
      meet_link TEXT,
      confirmation_sent BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS "user_32b62920".settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_price_cents INT NOT NULL DEFAULT 10000,
      currency TEXT NOT NULL DEFAULT 'usd',
      admin_email TEXT NOT NULL DEFAULT 'dr.saad@example.com',
      max_duration_minutes INT NOT NULL DEFAULT 120,
      min_duration_minutes INT NOT NULL DEFAULT 30,
      booking_advance_days INT NOT NULL DEFAULT 30,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS "user_32b62920".blocked_dates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      blocked_date DATE NOT NULL UNIQUE,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`,
  ];

  const results: string[] = [];
  for (const sql of migrations) {
    const { error } = await supabase.rpc('exec_sql', { sql }).single();
    results.push(error ? `ERROR: ${error.message}` : 'OK');
  }

  // Seed slots if none exist
  const { data: existing } = await supabase.from('availability_slots').select('id').limit(1);
  if (!existing || existing.length === 0) {
    const seedSlots = [
      { day_of_week: 1, start_time: '09:00', end_time: '11:00' },
      { day_of_week: 1, start_time: '14:00', end_time: '16:00' },
      { day_of_week: 2, start_time: '10:00', end_time: '12:00' },
      { day_of_week: 2, start_time: '15:00', end_time: '17:00' },
      { day_of_week: 3, start_time: '09:00', end_time: '11:00' },
      { day_of_week: 3, start_time: '13:00', end_time: '15:00' },
      { day_of_week: 4, start_time: '10:00', end_time: '12:00' },
      { day_of_week: 4, start_time: '14:00', end_time: '16:00' },
      { day_of_week: 5, start_time: '09:00', end_time: '11:00' },
      { day_of_week: 5, start_time: '13:00', end_time: '15:00' },
    ];
    await supabase.from('availability_slots').insert(seedSlots);
    results.push('Seeded 10 availability slots');
  }

  // Seed settings if none
  const { data: existingSettings } = await supabase.from('settings').select('id').limit(1);
  if (!existingSettings || existingSettings.length === 0) {
    await supabase.from('settings').insert({ session_price_cents: 10000, currency: 'usd', admin_email: 'dr.saad@example.com' });
    results.push('Seeded default settings');
  }

  return NextResponse.json({ results });
}
